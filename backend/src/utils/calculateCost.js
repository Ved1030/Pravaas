// Calculate total cost of a route
exports.calculateTotalCost = (steps = []) => {
  if (!Array.isArray(steps)) return 0;

  return steps.reduce((total, step) => {
    return total + (step.cost || 0);
  }, 0);
};