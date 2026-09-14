import Dexie, { type EntityTable } from 'dexie';
import type { Note, Sketch, SyncQueueItem } from '@/types';

export class InkifyDB extends Dexie {
  notes!: EntityTable<Note, 'id'>;
  sketches!: EntityTable<Sketch, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('inkify-db');
    this.version(1).stores({
      notes: 'id, ownerId, title, pinned, archived, createdAt, updatedAt, deletedAt, *tags',
      sketches: 'id, ownerId, title, createdAt, updatedAt, deletedAt',
      syncQueue: '++id, entityType, entityId, op, createdAt',
    });
  }
}

export const db = new InkifyDB();
