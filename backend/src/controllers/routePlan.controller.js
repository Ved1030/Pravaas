const { generateRoutes } = require("../services/routeEngine");

exports.planRoute = async (req, res) => {
  console.log("POST /api/route/plan hit");
  console.log("Request body:", req.body);

  const { source = "", destination = "" } = req.body;

  if (!source || !destination) {
    return res.status(400).json({ error: "source and destination are required" });
  }

  try {
    const { preferences } = req.body;
    const result = await generateRoutes(source, destination, preferences);
    res.json(result);
  } catch (err) {
    console.error("Route planning error:", err);
    res.status(500).json({ error: "Failed to plan route. Please try again.", details: err.message });
  }
};
