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

function simulateDisruption(route) {
  if (!route || !route.steps) return [];

  return route.steps.map((step) => {
    let delayMinutes = 0;
    let impactLevel = "low";

    if (step.mode === "train") {
      delayMinutes = Math.floor(Math.random() * 6) + 3;
      impactLevel = "high";
    } else if (step.mode === "bus") {
      delayMinutes = Math.floor(Math.random() * 5) + 2;
      impactLevel = "medium";
    } else if (step.mode === "metro") {
      delayMinutes = Math.floor(Math.random() * 3) + 1;
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

  const currentTime = currentRoute.totalTime || currentRoute.durationMin || 0;
  const currentCost = currentRoute.estimatedCost || currentRoute.totalCost || 0;

  const bestOption = alternativeRoutes.reduce((best, route) => {
    const altTime = route.totalTime || route.durationMin || 0;
    const altCost = route.estimatedCost || route.totalCost || 0;

    const timeSaved = currentTime - altTime;
    const costSaved = currentCost - altCost;
    const score = timeSaved * 2 + costSaved;

    if (!best || score > best.score) {
      return { route, timeSaved, costSaved, score };
    }
    return best;
  }, null);

  // Only recommend when there is a measurable time benefit
  if (!bestOption || bestOption.timeSaved <= 0) return null;

  const confidence = Math.min(95, Math.round(60 + Math.max(0, bestOption.score)));

  return {
    mode: bestOption.route.steps?.[0]?.mode || bestOption.route.type || "unknown",
    label: bestOption.route.label || bestOption.route.type || "Alternative",
    timeSaved: Math.round(bestOption.timeSaved),
    costSaved: Math.round(bestOption.costSaved),
    confidence,
    reason: "Faster and more efficient alternative detected",
    alternativeRoute: bestOption.route,
  };
}

/**
 * @param {object} input  - { source, destination, currentLocation, issueType }
 * @param {object} route  - The currently disrupted route (best route from engine)
 * @param {Array}  allRoutes - All route variants returned by the engine [fastest, cheapest, comfort]
 */
function handleDisruption(input, route, allRoutes = []) {
  const disruptedSteps = simulateDisruption(route);

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
