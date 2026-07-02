const db = require("../config/database");

function getAchievements() {
  return [
    { id: "ach_1", name: "Safe Traveller", description: "Complete 10 journeys with 100% safety score", icon: "shield", progress: 80, unlocked: false, requirement: 10, current: 8 },
    { id: "ach_2", name: "Early Bird", description: "Leave before recommended time 5 times", icon: "sunrise", progress: 60, unlocked: false, requirement: 5, current: 3 },
    { id: "ach_3", name: "Eco Hero", description: "Save 50kg CO2 through public transport", icon: "leaf", progress: 45, unlocked: false, requirement: 50, current: 22.5 },
    { id: "ach_4", name: "Metro Master", description: "Take 20 metro trips", icon: "train", progress: 70, unlocked: false, requirement: 20, current: 14 },
    { id: "ach_5", name: "Walking Champion", description: "Walk 50km total", icon: "footprints", progress: 30, unlocked: false, requirement: 50, current: 15 },
    { id: "ach_6", name: "Streak Master", description: "Maintain a 7-day journey streak", icon: "flame", progress: 100, unlocked: true, requirement: 7, current: 7 },
  ];
}

function getWeeklyGoals() {
  return {
    week: "Jun 30 - Jul 6, 2026",
    goals: [
      { id: "g1", name: "Complete 5 trips", current: 3, target: 5, progress: 60, reward: 50 },
      { id: "g2", name: "Use public transport 3 times", current: 2, target: 3, progress: 67, reward: 30 },
      { id: "g3", name: "Walk 5km total", current: 3.2, target: 5, progress: 64, reward: 25 },
      { id: "g4", name: "Save ₹200", current: 140, target: 200, progress: 70, reward: 40 },
    ],
    streak: 5,
    totalPoints: 1250,
    level: 12,
    nextLevelPoints: 1500,
    pointsToNextLevel: 250,
  };
}

function getMonthlyGoals() {
  return {
    month: "July 2026",
    goals: [
      { id: "mg1", name: "Complete 20 trips", current: 12, target: 20, progress: 60, reward: 200 },
      { id: "mg2", name: "Save ₹2000", current: 1400, target: 2000, progress: 70, reward: 300 },
      { id: "mg3", name: "Save 20kg CO2", current: 14, target: 20, progress: 70, reward: 250 },
      { id: "mg4", name: "Maintain 90%+ safety score", current: 92, target: 90, progress: 100, reward: 500 },
    ],
    rewardsEarned: 1250,
    badgesEarned: 2,
  };
}

function getRewardPoints() {
  return {
    totalPoints: 1250,
    lifetimePoints: 5800,
    level: 12,
    nextLevel: 13,
    pointsToNextLevel: 250,
    recentEarnings: [
      { description: "Daily streak bonus", points: 10, date: "Today" },
      { description: "Eco Hero milestone", points: 50, date: "Yesterday" },
      { description: "Weekly goal completed", points: 100, date: "2 days ago" },
      { description: "Safety champion", points: 25, date: "3 days ago" },
    ],
    redeemOptions: [
      { name: "₹50 Metro Pass", points: 500, category: "transport" },
      { name: "Free Bus Day Pass", points: 300, category: "transport" },
      { name: "₹100 Food Voucher", points: 800, category: "lifestyle" },
      { name: "Premium Analytics", points: 1000, category: "app" },
    ],
  };
}

function getJourneyStreak() {
  return {
    currentStreak: 5,
    longestStreak: 12,
    totalActiveDays: 45,
    thisMonth: {
      activeDays: 12,
      missedDays: 2,
      perfectDays: 8,
    },
    history: [
      { date: "2026-07-03", active: true, trips: 3 },
      { date: "2026-07-02", active: true, trips: 2 },
      { date: "2026-07-01", active: true, trips: 4 },
      { date: "2026-06-30", active: true, trips: 3 },
      { date: "2026-06-29", active: true, trips: 2 },
      { date: "2026-06-28", active: false, trips: 0 },
      { date: "2026-06-27", active: true, trips: 3 },
    ],
  };
}

module.exports = { getAchievements, getWeeklyGoals, getMonthlyGoals, getRewardPoints, getJourneyStreak };
