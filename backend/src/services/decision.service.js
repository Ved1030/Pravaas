const { sortRoutesByTime } = require("../utils/routeHelpers");

exports.getBestRoute = (routes) => {
  const sorted = sortRoutesByTime(routes);
  return sorted[0];
};

exports.getSwitchSuggestion = (routes) => {
  if (!routes || routes.length < 2) {
    return {
      message: "Not enough routes to compare",
    };
  }

  const sorted = sortRoutesByTime(routes);

  const best = sorted[0];
  const second = sorted[1];

  const timeSaved = second.totalTime - best.totalTime;

  let urgency = "Normal";

  if (timeSaved > 15) urgency = "High";
  else if (timeSaved > 8) urgency = "Medium";

  return {
    recommendedRoute: best,
    alternative: second,
    timeSaved,
    urgency,
    message: `🚀 Switch now → Save ${timeSaved} mins`,
  };
};