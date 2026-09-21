import { create } from 'zustand';
import { db } from '@/core/db/schema';
import type { Note } from '@/types';

const OWNER_ID = 'local-guest';

export type NoteFilter = 'all' | 'pinned' | 'archived' | 'trash';

interface NotesState {
  search: string;
  filter: NoteFilter;
  notes: Note[];
  setSearch: (q: string) => void;
  setFilter: (f: NoteFilter) => void;
  load: () => Promise<void>;
  createNote: () => Promise<Note>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteNoteForever: (id: string) => Promise<void>;
}

function sortByUpdated(a: Note, b: Note) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export const useNotesStore = create<NotesState>((set, get) => ({
  search: '',
  filter: 'all',
  notes: [],

  setSearch: (q) => set({ search: q }),

  setFilter: (f) => set({ filter: f }),

  load: async () => {
    const notes = await db.notes.toArray();
    set({ notes: notes.sort(sortByUpdated) });
  },

  createNote: async () => {
    const now = new Date().toISOString();
    const note: Note = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ownerId: OWNER_ID,
      title: 'Untitled',
      bodyMarkdown: '',
      tags: [],
      pinned: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await db.notes.add(note);
    set({ notes: [note, ...get().notes] });
    return note;
  },

  updateNote: async (id, patch) => {
    const updatedAt = new Date().toISOString();
    await db.notes.update(id, { ...patch, updatedAt });
    set({
      notes: get().notes
        .map((n) => (n.id === id ? { ...n, ...patch, updatedAt } : n))
        .sort(sortByUpdated),
    });
  },

  trashNote: async (id) => {
    await get().updateNote(id, { deletedAt: new Date().toISOString() });
  },

  restoreNote: async (id) => {
    await get().updateNote(id, { deletedAt: null, archived: false });
  },

  deleteNoteForever: async (id) => {
    await db.notes.delete(id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },
}));