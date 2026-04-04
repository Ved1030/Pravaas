const decisionService = require("../services/decision.service");
const impactService = require("../services/impact.service");

exports.getRecommendation = (req, res) => {
  const routes = req.body.routes;

  const result = decisionService.getSwitchSuggestion(routes);

  const impact = impactService.calculateImpact(result.timeSaved || 0);

  res.json({
    ...result,
    impact,
  });
};