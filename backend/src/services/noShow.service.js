function predictNoShow(inputs) {
  const {
    traffic = "medium",
    weather = "clear",
    distance = 10,
    journeyStatus = "on-time",
    crowd = "low",
    historicalBehaviour = "consistent",
  } = inputs;

  let score = 0;
  const factors = [];

  if (traffic === "high") { score += 25; factors.push({ name: "Heavy Traffic", impact: 25, detail: "Significant congestion on route" }); }
  else if (traffic === "medium") { score += 12; factors.push({ name: "Moderate Traffic", impact: 12, detail: "Some congestion expected" }); }
  else { factors.push({ name: "Low Traffic", impact: 0, detail: "Clear roads ahead" }); }

  if (weather === "rain" || weather === "storm") { score += 20; factors.push({ name: "Bad Weather", impact: 20, detail: "Rain/storm may deter travel" }); }
  else if (weather === "fog") { score += 10; factors.push({ name: "Foggy Conditions", impact: 10, detail: "Reduced visibility" }); }
  else { factors.push({ name: "Clear Weather", impact: 0, detail: "Favorable conditions" }); }

  if (distance > 30) { score += 15; factors.push({ name: "Long Distance", impact: 15, detail: `${distance}km commute increases no-show risk` }); }
  else if (distance > 15) { score += 8; factors.push({ name: "Moderate Distance", impact: 8, detail: `${distance}km commute` }); }

  if (journeyStatus === "delayed") { score += 18; factors.push({ name: "Journey Delayed", impact: 18, detail: "Current journey facing delays" }); }
  else if (journeyStatus === "disrupted") { score += 25; factors.push({ name: "Journey Disrupted", impact: 25, detail: "Major disruption on route" }); }

  if (crowd === "high") { score += 10; factors.push({ name: "High Crowd", impact: 10, detail: "Overcrowded transit" }); }

  if (historicalBehaviour === "inconsistent") { score += 20; factors.push({ name: "Inconsistent History", impact: 20, detail: "Past no-shows detected" }); }
  else if (historicalBehaviour === "occasional") { score += 10; factors.push({ name: "Occasional Absence", impact: 10, detail: "Some past absences" }); }
  else { factors.push({ name: "Reliable History", impact: -5, detail: "Consistent attendance record" }); score -= 5; }

  score = Math.max(0, Math.min(100, score));

  let level, color, bgColor;
  if (score >= 60) { level = "High"; color = "text-red-600"; bgColor = "bg-red-50"; }
  else if (score >= 30) { level = "Medium"; color = "text-amber-600"; bgColor = "bg-amber-50"; }
  else { level = "Low"; color = "text-emerald-600"; bgColor = "bg-emerald-50"; }

  const recommendations = [];
  if (score >= 60) {
    recommendations.push("Suggest rescheduling to virtual interview");
    recommendations.push("Send a reminder 30 minutes before");
    recommendations.push("Prepare backup candidate");
  } else if (score >= 30) {
    recommendations.push("Send arrival reminder via SMS");
    recommendations.push("Share live traffic updates");
  } else {
    recommendations.push("No special action needed");
    recommendations.push("Standard confirmation message is sufficient");
  }

  return {
    probability: score,
    level,
    color,
    bgColor,
    factors,
    recommendations,
    reasoning: `Based on ${factors.length} factors including ${factors.filter(f => f.impact > 0).map(f => f.name).join(", ") || "favorable conditions"}`,
  };
}

module.exports = { predictNoShow };
