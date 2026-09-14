import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

const LoginScreen = lazy(() => import('@/features/auth/LoginScreen'));
const NotesList = lazy(() => import('@/features/notes/NotesList'));
const NoteEditor = lazy(() => import('@/features/notes/NoteEditor'));
const SketchCanvas = lazy(() => import('@/features/sketch/SketchCanvas'));
const NotFound = lazy(() => import('@/shared/components/NotFound'));

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/notes" replace />} />
          <Route path="/notes" element={<NotesList />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteEditor />} />
          <Route path="/sketch/new" element={<SketchCanvas />} />
          <Route path="/sketch/:id" element={<SketchCanvas />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
