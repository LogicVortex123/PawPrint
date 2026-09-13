// TR-007: percentage change vs the immediately preceding entry, computed on
// read over a chronologically sorted list so mobile and web see identical trends.
function withTrend(weightRecordsAsc) {
  return weightRecordsAsc.map((record, index) => {
    const obj = record.toObject ? record.toObject() : record;
    if (index === 0) return { ...obj, trendPercent: null };

    const previous = weightRecordsAsc[index - 1];
    const previousWeight = previous.weightKg;
    const trendPercent = previousWeight === 0
      ? null
      : Number((((obj.weightKg - previousWeight) / previousWeight) * 100).toFixed(2));

    return { ...obj, trendPercent };
  });
}

module.exports = { withTrend };
