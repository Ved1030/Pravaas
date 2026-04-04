exports.getConfidenceScore = (route) => {
  const base = route.reliability || 80;
  const delay = route.delayFactor || 0;
  const transfers = route.steps.length - 1;

  let score = base - (delay * 3 + transfers * 5);

  return Math.max(50, Math.min(100, score));
};