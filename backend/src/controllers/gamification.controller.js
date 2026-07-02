const gamificationService = require("../services/gamification.service");

exports.achievements = async (req, res) => {
  try {
    const achievements = gamificationService.getAchievements();
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ error: "Failed to load achievements", details: err.message });
  }
};

exports.weeklyGoals = async (req, res) => {
  try {
    const goals = gamificationService.getWeeklyGoals();
    res.json({ success: true, ...goals });
  } catch (err) {
    res.status(500).json({ error: "Failed to load weekly goals", details: err.message });
  }
};

exports.monthlyGoals = async (req, res) => {
  try {
    const goals = gamificationService.getMonthlyGoals();
    res.json({ success: true, ...goals });
  } catch (err) {
    res.status(500).json({ error: "Failed to load monthly goals", details: err.message });
  }
};

exports.rewards = async (req, res) => {
  try {
    const rewards = gamificationService.getRewardPoints();
    res.json({ success: true, ...rewards });
  } catch (err) {
    res.status(500).json({ error: "Failed to load rewards", details: err.message });
  }
};

exports.streak = async (req, res) => {
  try {
    const streak = gamificationService.getJourneyStreak();
    res.json({ success: true, ...streak });
  } catch (err) {
    res.status(500).json({ error: "Failed to load streak", details: err.message });
  }
};
