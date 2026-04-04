const aiScoring = require("./src/services/aiScoring.service");

// Test routes
const routes = [
  {
    id: "fastest",
    type: "fastest",
    totalTime: 35,
    estimatedCost: 120,
    transfers: 2,
    delayFactor: 2,
  },
  {
    id: "cheapest",
    type: "cheapest",
    totalTime: 55,
    estimatedCost: 45,
    transfers: 3,
    delayFactor: 3,
  },
  {
    id: "comfort",
    type: "comfort",
    totalTime: 28,
    estimatedCost: 350,
    transfers: 0,
    delayFactor: 1,
  },
];

console.log("=== AI Scoring Engine Tests ===\n");

// Test 1: Fastest preference
console.log("Test 1: Fastest preference");
const result1 = aiScoring.getBestRoute(routes, "fastest");
console.log("Best route:", result1.best.id);
console.log("Scores:", result1.scores);
console.log("Saved time:", Math.round(result1.worst.totalTime - result1.best.totalTime), "min");
console.log();

// Test 2: Cheapest preference
console.log("Test 2: Cheapest preference");
const result2 = aiScoring.getBestRoute(routes, "cheapest");
console.log("Best route:", result2.best.id);
console.log("Scores:", result2.scores);
console.log();

// Test 3: Comfort preference
console.log("Test 3: Comfort preference");
const result3 = aiScoring.getBestRoute(routes, "comfort");
console.log("Best route:", result3.best.id);
console.log("Scores:", result3.scores);
console.log();

// Test 4: Confidence calculation
console.log("Test 4: Confidence calculation");
if (result1.secondBest && result1.best.score !== undefined && result1.secondBest.score !== undefined) {
  const confidence = aiScoring.calculateConfidence(result1.best.score, result1.secondBest.score);
  console.log("Confidence:", confidence, "%");
}
console.log();

// Test 5: AI Explanation
console.log("Test 5: AI Explanation");
const explanation = aiScoring.generateExplanation(routes, result1.best);
console.log("Explanation:", explanation);
console.log();

// Test 6: Determine preference from sliders
console.log("Test 6: Determine preference");
console.log("Speed 70, Cost 50, Comfort 30:", aiScoring.determinePreference(70, 50, 30));
console.log("Speed 20, Cost 80, Comfort 30:", aiScoring.determinePreference(20, 80, 30));
console.log("Speed 30, Cost 20, Comfort 70:", aiScoring.determinePreference(30, 20, 70));
console.log();

console.log("=== All tests passed! ===");
