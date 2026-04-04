// Sum array values
exports.sum = (arr = []) => {
  return arr.reduce((a, b) => a + b, 0);
};

// Clamp value between min and max
exports.clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

// Generate random delay (for simulation)
exports.getRandomDelay = (min = 5, max = 15) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};