// ═══════════════════════════════════════════════════════════════════════════════
// Inkify — Shared Domain Types
// ═══════════════════════════════════════════════════════════════════════════════
// These types are imported by ALL layers (shared, core, features, app).
// Zero runtime dependencies — pure TypeScript interfaces/types only.

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
}

export interface Note {
  id: string;
  ownerId: string;
  title: string;
  bodyMarkdown: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Sketch {
  id: string;
  ownerId: string;
  title: string;
  strokes: SketchStroke[];
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SketchStroke {
  points: [number, number][];
  pressure: number[];
  color: string;
  size: number;
  tool: 'pen' | 'eraser' | 'line' | 'rect' | 'ellipse' | 'text';
}

export type SyncOpType = 'upsert' | 'delete';

export interface SyncQueueItem {
  id?: number;
  entityType: 'note' | 'sketch';
  entityId: string;
  op: SyncOpType;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}
