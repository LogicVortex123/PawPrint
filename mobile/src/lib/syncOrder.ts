export type SyncEntity = 'pet' | 'vaccination' | 'weight' | 'appointment' | 'document';

const RANK: Record<SyncEntity, number> = {
  pet: 0,
  vaccination: 1,
  weight: 1,
  appointment: 1,
  document: 1,
};

export interface SyncItem {
  entity: SyncEntity;
  localId: string;
}

// Pets go first so a vaccination logged offline can use the server id of its pet.
export function orderForPush<T extends SyncItem>(items: T[]): T[] {
  return [...items].sort((a, b) => RANK[a.entity] - RANK[b.entity]);
}
