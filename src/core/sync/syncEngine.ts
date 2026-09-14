import { db } from '@/core/db/schema';
import type { SyncQueueItem } from '@/types';
import { showToast } from '@/shared/components/Toaster';

let flushing = false;

export async function enqueue(
  entityType: SyncQueueItem['entityType'],
  entityId: string,
  op: SyncQueueItem['op'],
  payload: Record<string, unknown>,
): Promise<void> {
  await db.syncQueue.add({
    entityType,
    entityId,
    op,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
}

export async function flushSyncQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;

  try {
    const items = await db.syncQueue.orderBy('createdAt').toArray();
    if (items.length === 0) return;

    let successCount = 0;
    for (const item of items) {
      try {
        // TODO Stage 3/4: implement Firestore write per entityType
        await db.syncQueue.delete(item.id!);
        successCount++;
      } catch {
        await db.syncQueue.update(item.id!, { retryCount: item.retryCount + 1 });
      }
    }

    if (successCount > 0) {
      showToast(`Synced ${successCount} item${successCount > 1 ? 's' : ''}`, 'success');
    }
  } finally {
    flushing = false;
  }
}

// Auto-flush on reconnect
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushSyncQueue());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void flushSyncQueue();
  });
}
