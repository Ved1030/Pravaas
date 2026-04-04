const express = require("express");
const cors = require("cors");

const routeRoutes = require("./routes/route.routes");
const routePlanRoutes = require("./routes/routePlan.routes");
const disruptionRoutes = require("./routes/disruption.routes");
const decisionRoutes = require("./routes/decision.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/routes", routeRoutes);
app.use("/api/route", routePlanRoutes);
app.use("/api/disruption", disruptionRoutes);
app.use("/api/decision", decisionRoutes);

app.get("/", (req, res) => {
  res.send("SmartCommute API Running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working" });
});

module.exports = app;