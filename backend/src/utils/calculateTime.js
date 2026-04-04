// Calculate total time of a route
exports.calculateTotalTime = (steps = []) => {
  if (!Array.isArray(steps)) return 0;

  return steps.reduce((total, step) => {
    return total + (step.time || 0);
  }, 0);
};