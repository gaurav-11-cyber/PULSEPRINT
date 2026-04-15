function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getSignalQuality(value) {
  const magnitude = Math.abs(value);
  if (magnitude > 1.05 || magnitude < 0.05) return "poor";
  if (magnitude > 0.9 || magnitude < 0.15) return "medium";
  return "good";
}

function getCorrelationScore(value) {
  const centered = 1 - Math.abs(0.55 - Math.abs(value));
  const noisy = centered * 0.72 + randomBetween(0.15, 0.26);
  return Math.max(0.45, Math.min(0.99, noisy));
}

module.exports = { getSignalQuality, getCorrelationScore };

