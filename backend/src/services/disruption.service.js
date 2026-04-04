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

function handleDisruption(input, route) {
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

  return {
    disruptedRoute,
    disruptedSteps,
    switchOptions,
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
  getCurrentSwitchOptions,
  getLastMileOptions,
  handleDisruption,
  applyDelay,
};
