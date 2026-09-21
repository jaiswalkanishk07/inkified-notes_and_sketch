import StarterKit from '@tiptap/starter-kit';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { useNotesStore } from './notesStore';
import { showToast } from '@/shared/components/Toaster';

import type { Editor, JSONContent } from '@tiptap/core';

function docToMarkdown(editor: Editor): string {
  return editor.storage.markdown.manager.serialize(
    (editor.state.doc as unknown as { toJSON: () => JSONContent }).toJSON(),
  );
}

interface Props {
  noteId: string;
  initialMarkdown: string;
  readOnly?: boolean;
  onBodyChange?: (markdown: string) => void;
}

export default function TipTapEditor({ noteId, initialMarkdown, readOnly = false, onBodyChange }: Props) {
  const updateNote = useNotesStore((s) => s.updateNote);
  const saveTimer = useRef<number | null>(null);
  const pendingMarkdown = useRef<string | null>(null);
  const onBodyChangeRef = useRef(onBodyChange);
  onBodyChangeRef.current = onBodyChange;

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ link: { openOnClick: false } }),
        TaskList,
        TaskItem,
        Markdown,
      ],
      content: initialMarkdown,
      contentType: 'markdown',
      editable: !readOnly,
      editorProps: {
        attributes: {
          class:
            'prose prose-slate dark:prose-invert max-w-none min-h-[50vh] rounded-lg border border-slate-200 bg-white p-4 focus:outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800',
        },
      },
      onUpdate: ({ editor }) => {
        try {
          const md = docToMarkdown(editor);
          pendingMarkdown.current = md;
          onBodyChangeRef.current?.(md);
          if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
          saveTimer.current = window.setTimeout(() => {
            saveTimer.current = null;
            if (pendingMarkdown.current !== null) {
              void updateNote(noteId, { bodyMarkdown: pendingMarkdown.current });
            }
          }, 800);
        } catch {
          showToast('Could not save note', 'error');
        }
      },
    },
    [noteId],
  );

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Load fresh markdown when switching notes (editor instance is keyed per note,
  // this is a safety net for remount edge cases).
  useEffect(() => {
    if (editor && initialMarkdown !== docToMarkdown(editor)) {
      editor.commands.setContent(initialMarkdown, { contentType: 'markdown' });
    }
    // Only sync on mount/note switch — not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(
    () => () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      // Flush any unsaved keystrokes. Editor teardown is handled by useEditor.
      if (pendingMarkdown.current !== null) {
        void updateNote(noteId, { bodyMarkdown: pendingMarkdown.current });
      }
    },
    [noteId, updateNote],
  );

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
