import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotesStore, type NoteFilter } from './notesStore';

const FILTERS: { id: NoteFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'archived', label: 'Archived' },
  { id: 'trash', label: 'Trash' },
];

function stripMarkdown(md: string): string {
  return md
    .replace(/[#>*_`~\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function NotesList() {
  const { notes, search, filter, setSearch, setFilter, load } = useNotesStore();

  useEffect(() => {
    void load();
  }, [load]);

  const visible = notes
    .filter((n) => {
      if (filter === 'trash') return n.deletedAt !== null;
      if (n.deletedAt !== null) return false;
      if (filter === 'pinned') return n.pinned;
      if (filter === 'archived') return n.archived;
      return !n.archived;
    })
    .filter((n) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return n.title.toLowerCase().includes(q) || n.bodyMarkdown.toLowerCase().includes(q);
    });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800"
        />
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                filter === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link
          to="/notes/new"
          className="ml-auto rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Note
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
          No notes here. Tap + New Note to start writing.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((n) => (
            <Link
              key={n.id}
              to={`/notes/${n.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate font-semibold">{n.title || 'Untitled'}</h3>
                {n.pinned && <span className="text-xs">📌</span>}
              </div>
              <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {stripMarkdown(n.bodyMarkdown) || 'Empty note'}
              </p>
              <span className="mt-2 block text-xs text-slate-400">
                {new Date(n.updatedAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
