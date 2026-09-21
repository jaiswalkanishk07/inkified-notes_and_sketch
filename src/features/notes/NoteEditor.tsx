import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useNotesStore } from './notesStore';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { showToast } from '@/shared/components/Toaster';
import type { Note } from '@/types';

// TipTap loads lazily so the notes list stays small; the editor chunk only
// downloads when a note is actually opened.
const TipTapEditor = lazy(() => import('./TipTapEditor'));

function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, load, createNote, updateNote, trashNote, restoreNote, deleteNoteForever } =
    useNotesStore();
  const [currentId, setCurrentId] = useState<string | null>(id && id !== 'new' ? id : null);
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [importKey, setImportKey] = useState(0);
  const creatingRef = useRef<Promise<Note> | null>(null);
  const titleTimer = useRef<number | null>(null);
  const pendingTitle = useRef<string | null>(null);
  const latestBody = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentIdRef = useRef<string | null>(currentId);
  currentIdRef.current = currentId;

  const flushTitle = useCallback(() => {
    if (titleTimer.current !== null) {
      window.clearTimeout(titleTimer.current);
      titleTimer.current = null;
    }
    const nextTitle = pendingTitle.current;
    const noteId = currentIdRef.current;
    pendingTitle.current = null;
    if (nextTitle !== null && noteId) {
      void updateNote(noteId, { title: nextTitle });
    }
  }, [updateNote]);

  // Ensure the note exists (create on /notes/new), then resolve id.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await load();
      if (cancelled) return;
      if (id && id !== 'new') {
        setCurrentId(id);
        return;
      }
      if (!creatingRef.current) {
        creatingRef.current = createNote();
        void creatingRef.current.finally(() => {
          creatingRef.current = null;
        });
      }
      const note = await creatingRef.current;
      if (!cancelled) {
        setCurrentId(note.id);
        navigate(`/notes/${note.id}`, { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, load, createNote, navigate]);

  useEffect(() => {
    setTitleDraft(null);
    latestBody.current = null;
  }, [currentId]);

  useEffect(() => () => flushTitle(), [flushTitle]);

  const note = currentId ? notes.find((n) => n.id === currentId) : undefined;
  const missing = !note && id && id !== 'new';
  if (!note) {
    return missing ? (
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-xl font-semibold">Note not found</h2>
        <p className="mb-4 text-sm text-slate-500">It may have been permanently deleted.</p>
        <Link to="/notes" className="text-sm font-medium text-indigo-600 hover:underline">
          Back to notes
        </Link>
      </div>
    ) : (
      <PageSkeleton />
    );
  }

  const trashed = note.deletedAt !== null;
  const shownTitle = titleDraft ?? note.title;

  const handleTitleChange = (value: string) => {
    setTitleDraft(value);
    pendingTitle.current = value;
    if (titleTimer.current !== null) window.clearTimeout(titleTimer.current);
    titleTimer.current = window.setTimeout(flushTitle, 600);
  };

  const handleExport = () => {
    flushTitle();
    const markdown = latestBody.current ?? note.bodyMarkdown;
    const slug =
      (shownTitle || 'note')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'note';
    downloadMarkdown(`${slug}.md`, markdown);
    showToast('Markdown exported', 'success');
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      flushTitle();
      const baseName = file.name.replace(/\.md$/i, '');
      await updateNote(note.id, {
        bodyMarkdown: text,
        ...(shownTitle === 'Untitled' && baseName ? { title: baseName } : {}),
      });
      latestBody.current = text;
      setImportKey((k) => k + 1);
      showToast('Markdown imported', 'success');
    } catch {
      showToast('Could not import Markdown file', 'error');
    }
  };

  const handleDeleteForever = async () => {
    if (!window.confirm('Permanently delete this note? This cannot be undone.')) return;
    await deleteNoteForever(note.id);
    showToast('Note permanently deleted', 'success');
    navigate('/notes', { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          to="/notes"
          className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          ← Notes
        </Link>
        <span className="ml-auto text-xs text-slate-400">
          Updated {new Date(note.updatedAt).toLocaleString()}
        </span>
      </div>

      <input
        value={shownTitle}
        placeholder="Title"
        disabled={trashed}
        onChange={(e) => handleTitleChange(e.target.value)}
        onBlur={flushTitle}
        className="mb-4 w-full border-none bg-transparent text-3xl font-bold outline-none placeholder:text-slate-300 disabled:opacity-60 dark:placeholder:text-slate-600"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => void updateNote(note.id, { pinned: !note.pinned })}
          disabled={trashed}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {note.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button
          onClick={() => void updateNote(note.id, { archived: !note.archived })}
          disabled={trashed}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {note.archived ? 'Unarchive' : 'Archive'}
        </button>
        {trashed ? (
          <>
            <button
              onClick={() => void restoreNote(note.id)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Restore
            </button>
            <button
              onClick={() => void handleDeleteForever()}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              Delete forever
            </button>
          </>
        ) : (
          <button
            onClick={() => void trashNote(note.id)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Trash
          </button>
        )}
        <button
          onClick={handleExport}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Export .md
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={trashed}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Import .md
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void handleImportFile(file);
          }}
        />
      </div>

      {trashed && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          This note is in Trash and is read-only. Restore it to keep editing.
        </p>
      )}

      <Suspense fallback={<PageSkeleton />}>
        <TipTapEditor
          key={`${note.id}-${importKey}`}
          noteId={note.id}
          initialMarkdown={note.bodyMarkdown}
          readOnly={trashed}
          onBodyChange={(md) => {
            latestBody.current = md;
          }}
        />
      </Suspense>
    </div>
  );
}
