const recruiterService = require("../services/recruiter.service");

exports.dashboard = async (req, res) => {
  try {
    const data = recruiterService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load recruiter dashboard", details: err.message });
  }
};

exports.candidates = async (req, res) => {
  try {
    const candidates = recruiterService.getCandidates();
    res.json({ success: true, candidates });
  } catch (err) {
    res.status(500).json({ error: "Failed to load candidates", details: err.message });
  }
};

exports.reschedule = async (req, res) => {
  try {
    const { candidateId, newTime } = req.body;
    if (!candidateId || !newTime) {
      return res.status(400).json({ error: "candidateId and newTime are required" });
    }
    const result = recruiterService.reschedule(candidateId, newTime);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Reschedule failed", details: err.message });
  }
};

exports.virtual = async (req, res) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: "candidateId is required" });
    }
    const result = recruiterService.suggestVirtual(candidateId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Virtual suggestion failed", details: err.message });
  }
};
