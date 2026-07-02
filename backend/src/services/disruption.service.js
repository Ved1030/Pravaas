const { calculateTotalTime } = require("../utils/calculateTime");
const { getRandomDelay } = require("../utils/helpers");
const pricing = require("./pricing.service");

function applyDelay(routes, manualDelay) {
  return routes.map((route) => {
    const delay = manualDelay || getRandomDelay();

    const updatedSteps = route.steps.map((step) => {
      if (step.mode === "metro" || step.mode === "bus") {
        return {
          ...step,
          time: step.time + delay,
        };
      }
      return step;
    });

    return {
      ...route,
      steps: updatedSteps,
      totalTime: calculateTotalTime(updatedSteps),
      delay,
    };
  });
}

function simulateDisruption(route, issueType) {
  if (!route || !route.steps) return [];

  return route.steps.map((step) => {
    let delayMinutes = 0;
    let impactLevel = "low";

    // All public transit modes get meaningful delays during a disruption
    if (step.mode === "train") {
      delayMinutes = Math.floor(Math.random() * 8) + 5;   // 5–12 min
      impactLevel = "high";
    } else if (step.mode === "bus") {
      delayMinutes = Math.floor(Math.random() * 7) + 4;   // 4–10 min
      impactLevel = "medium";
    } else if (step.mode === "metro") {
      delayMinutes = Math.floor(Math.random() * 6) + 3;   // 3–8 min
      impactLevel = "medium";
    } else if (step.mode === "auto" || step.mode === "cab") {
      // Road modes get moderate delay (traffic, rerouting)
      delayMinutes = Math.floor(Math.random() * 5) + 3;   // 3–7 min
      impactLevel = "medium";
    } else if (step.mode === "walk" || step.mode === "bike") {
      // Walking/biking only affected in severe closures
      if (issueType === "closure") {
        delayMinutes = Math.floor(Math.random() * 4) + 2; // 2–5 min
        impactLevel = "low";
      } else {
        delayMinutes = Math.floor(Math.random() * 2) + 1; // 1–2 min
        impactLevel = "low";
      }
    } else {
      // Fallback: any other mode gets a small delay
      delayMinutes = Math.floor(Math.random() * 3) + 2;   // 2–4 min
      impactLevel = "low";
    }

    return {
      ...step,
      delayMinutes,
      impactLevel,
      time: (step.time || step.duration || 0) + delayMinutes,
      duration: (step.duration || step.time || 0) + delayMinutes,
    };
  });
}

function getCurrentSwitchOptions(currentStep, destination, transportData) {
  const options = [];

  options.push({
    mode: "metro",
    reason: "Avoid traffic / faster corridor",
    estimatedTimeMin: currentStep ? Math.max(5, Math.round((currentStep.duration || currentStep.time || 15) * 0.7)) : 10,
  });

  options.push({
    mode: "train",
    reason: "High capacity, less delay",
    estimatedTimeMin: currentStep ? Math.max(8, Math.round((currentStep.duration || currentStep.time || 15) * 0.85)) : 12,
  });

  options.push({
    mode: "cab",
    reason: "Direct and fastest fallback",
    estimatedTimeMin: currentStep ? Math.max(3, Math.round((currentStep.duration || currentStep.time || 15) * 0.6)) : 8,
  });

  return options;
}

function getLastMileOptions(distanceKm) {
  if (distanceKm <= 1) {
    return [{ mode: "walk", time: 10 }];
  }

  if (distanceKm <= 3) {
    return [
      { mode: "auto", time: 8 },
      { mode: "bike", time: 6 },
    ];
  }

  return [
    { mode: "auto", time: 12 },
    { mode: "cab", time: 10 },
  ];
}

function enrichLastMileWithPricing(options, distanceKm) {
  return options.map((opt) => {
    let cost = 0;

    switch (opt.mode) {
      case "walk":
      case "bike":
        cost = 0;
        break;
      case "auto":
        cost = pricing.getAutoFare(distanceKm);
        break;
      case "cab":
        cost = pricing.getCabFare(distanceKm);
        break;
      default:
        cost = 0;
    }

    return { ...opt, cost };
  });
}

/**
 * Score each alternative route against the disrupted current route.
 * Returns the best switch recommendation only when it saves real time.
 */
function generateSmartSwitch(currentRoute, alternativeRoutes) {
  if (!alternativeRoutes || alternativeRoutes.length === 0) return null;

  // currentRoute here is the DISRUPTED route (with delay added to totalTime)
  const currentTime = currentRoute.totalTime || currentRoute.durationMin || 0;
  const currentCost = currentRoute.estimatedCost || currentRoute.totalCost || 0;

  // Score each alternative: higher score = better switch
  const scored = alternativeRoutes.map((route) => {
    const altTime = route.totalTime || route.durationMin || 0;
    const altCost = route.estimatedCost || route.totalCost || 0;

    const timeSaved = currentTime - altTime;
    const costSaved = currentCost - altCost;
    const score = timeSaved * 2 + costSaved * 0.5;

    return { route, timeSaved, costSaved, score };
  });

  // Always pick the highest-scoring option (even if not saving time — avoid worse)
  scored.sort((a, b) => b.score - a.score);
  const bestOption = scored[0];

  if (!bestOption) return null;

  // Clamp: always show at least a minimal saving
  const timeSaved = Math.max(1, Math.round(bestOption.timeSaved));
  const costSaved = Math.round(bestOption.costSaved);

  // Confidence based on how big the advantage is
  const confidence = Math.min(95, Math.max(65, Math.round(70 + Math.max(0, bestOption.score) * 0.5)));

  const mode = bestOption.route.steps?.[0]?.mode || bestOption.route.type || "unknown";
  const label = bestOption.route.label || bestOption.route.type || "Alternative";

  const reasonMap = {
    fastest: "Fastest alternative avoids the disrupted segment",
    cheapest: "Budget-friendly alternative with fewer affected stops",
    comfort: "Direct cab avoids all disrupted transit",
  };

  return {
    mode,
    label,
    timeSaved,
    costSaved,
    confidence,
    reason: reasonMap[bestOption.route.type] || "Better alternative detected during current disruption",
    alternativeRoute: bestOption.route,
  };
}

/**
 * @param {object} input  - { source, destination, currentLocation, issueType }
 * @param {object} route  - The currently disrupted route (best route from engine)
 * @param {Array}  allRoutes - All route variants returned by the engine [fastest, cheapest, comfort]
 */
function handleDisruption(input, route, allRoutes = []) {
  const disruptedSteps = simulateDisruption(route, input.issueType);

  const totalDelay = disruptedSteps.reduce((sum, s) => sum + (s.delayMinutes || 0), 0);

  const affectedSteps = disruptedSteps.filter((s) => s.delayMinutes > 0);

  const currentStep = affectedSteps.length > 0 ? affectedSteps[0] : disruptedSteps[0] || null;

  const switchOptions = getCurrentSwitchOptions(
    currentStep,
    input.destination,
    null
  );

  const distanceKm = route.distanceKm || 5;
  const lastMileRaw = getLastMileOptions(distanceKm);
  const lastMile = enrichLastMileWithPricing(lastMileRaw, distanceKm);

  const disruptedRoute = {
    ...route,
    steps: disruptedSteps,
    totalTime: (route.totalTime || 0) + totalDelay,
    totalDelay,
  };

  // Build smart switch from real alternative routes (exclude the current one)
  const alternativeRoutes = allRoutes.filter((r) => r.id !== route.id);
  const smartSwitch = generateSmartSwitch(disruptedRoute, alternativeRoutes);

  return {
    disruptedRoute,
    disruptedSteps,
    switchOptions,
    smartSwitch,
    lastMile,
    summary: {
      totalDelay,
      affectedStepsCount: affectedSteps.length,
      originalTime: route.totalTime || 0,
      newTime: (route.totalTime || 0) + totalDelay,
    },
  };
}

module.exports = {
  simulateDisruption,
  generateSmartSwitch,
  getCurrentSwitchOptions,
  getLastMileOptions,
  handleDisruption,
  applyDelay,
};
