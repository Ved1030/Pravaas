const { getConfidenceScore } = require("../utils/confidenceScore");

exports.calculateConfidence = (route) => {
  return getConfidenceScore(route);
};