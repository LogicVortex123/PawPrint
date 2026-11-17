import assert from 'node:assert/strict';
import test from 'node:test';
import { orderForPush } from './syncOrder.ts';

test('pets are pushed before the records that belong to them', () => {
  const ordered = orderForPush([
    { entity: 'vaccination', localId: 'v' },
    { entity: 'document', localId: 'd' },
    { entity: 'pet', localId: 'p' },
    { entity: 'weight', localId: 'w' },
    { entity: 'appointment', localId: 'a' },
  ]);
  assert.equal(ordered[0].entity, 'pet');
  assert.deepEqual(ordered.slice(1).map((item) => item.entity).sort(), ['appointment', 'document', 'vaccination', 'weight']);
});
