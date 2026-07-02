exports.getConfidenceScore = (route) => {
  const base = route.reliability || 80;
  const delay = route.delayFactor || 0;
  const stepsArray = route.steps;
  if (!Array.isArray(stepsArray)) {
    const stepsCount = route.transfers !== undefined ? route.transfers + 1 : 1;
    const transfers = route.transfers || 0;
    let score = base - (delay * 3 + transfers * 5);
    return Math.max(50, Math.min(100, score));
  }
  const transfers = stepsArray.length - 1;
  let score = base - (delay * 3 + transfers * 5);
  return Math.max(50, Math.min(100, score));
};