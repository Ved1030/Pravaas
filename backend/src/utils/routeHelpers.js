// Sort routes by total time
exports.sortRoutesByTime = (routes = []) => {
  return [...routes].sort((a, b) => a.totalTime - b.totalTime);
};

// Get best (fastest) route
exports.getBestRoute = (routes = []) => {
  if (!routes.length) return null;

  return routes.reduce((best, current) =>
    current.totalTime < best.totalTime ? current : best
  );
};

// Calculate time difference between two routes
exports.getTimeDifference = (routeA, routeB) => {
  if (!routeA || !routeB) return 0;

  return Math.abs(routeA.totalTime - routeB.totalTime);
};

// Get cheapest route
exports.getCheapestRoute = (routes = []) => {
  return routes.reduce((best, current) =>
    current.totalCost < best.totalCost ? current : best
  );
};