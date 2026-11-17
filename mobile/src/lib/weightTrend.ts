export interface WeighIn {
  weightKg: number;
}

export function withTrend<T extends WeighIn>(recordsAsc: T[]): (T & { trendPercent: number | null })[] {
  return recordsAsc.map((record, index) => {
    if (index === 0) return { ...record, trendPercent: null };
    const previousWeight = recordsAsc[index - 1].weightKg;
    const trendPercent = previousWeight === 0
      ? null
      : Number((((record.weightKg - previousWeight) / previousWeight) * 100).toFixed(2));
    return { ...record, trendPercent };
  });
}

export function weightInsight(recordsAsc: WeighIn[]): string | null {
  const trended = withTrend(recordsAsc);
  const latest = trended[trended.length - 1];
  if (!latest || latest.trendPercent == null) return null;
  const change = Math.abs(latest.trendPercent);
  if (change < 0.05) return 'Weight is steady since the last weigh-in. This is not a medical assessment.';
  const direction = latest.trendPercent > 0 ? 'increased' : 'decreased';
  return `Weight ${direction} by ${change}% since the last weigh-in. This is not a medical assessment.`;
}
