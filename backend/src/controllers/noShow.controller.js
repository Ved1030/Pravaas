const { predictNoShow } = require("../services/noShow.service");

exports.predict = async (req, res) => {
  try {
    const inputs = req.body;
    const prediction = predictNoShow(inputs);
    res.json({ success: true, prediction });
  } catch (err) {
    res.status(500).json({ error: "No-show prediction failed", details: err.message });
  }
};
