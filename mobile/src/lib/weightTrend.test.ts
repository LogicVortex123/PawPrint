import assert from 'node:assert/strict';
import test from 'node:test';
import { weightInsight, withTrend } from './weightTrend.ts';

test('the first weigh-in has no trend', () => {
  assert.deepEqual(withTrend([{ weightKg: 10 }]), [{ weightKg: 10, trendPercent: null }]);
});

test('trend is the percent change from the previous entry', () => {
  const result = withTrend([{ weightKg: 10 }, { weightKg: 10.4 }]);
  assert.equal(result[1].trendPercent, 4);
});

test('insight stays non-diagnostic', () => {
  const text = weightInsight([{ weightKg: 10 }, { weightKg: 10.4 }]);
  assert.match(text || '', /increased by 4%/);
  assert.match(text || '', /not a medical assessment/);
});
