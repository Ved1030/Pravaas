const studentService = require("../services/student.service");

exports.dashboard = async (req, res) => {
  try {
    const data = studentService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load student dashboard", details: err.message });
  }
};
