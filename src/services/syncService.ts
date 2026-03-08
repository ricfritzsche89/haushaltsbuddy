import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useStore } from '../store/useStore';

export type SyncEvent = {
    type: 'TASK_ADDED' | 'TASK_UPDATED' | 'TASK_REMOVED' | 'WALL_POSTED' | 'XP_ADDED' | 'PENALTY_ADDED';
    payload: string; // JSON stringified data
    origin: string; // unique browser/device ID to avoid self-syncing
    timestamp: any;
};

// Simple unique ID for the current browser session
const originId = Math.random().toString(36).substring(2, 15);

/**
 * Publishes an event to Firebase so other devices can sync.
 */
export async function publishEvent(type: SyncEvent['type'], data: any) {
    try {
        const eventsRef = collection(db, 'family_events');
        await addDoc(eventsRef, {
            type,
            payload: JSON.stringify(data),
            origin: originId,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error publishing sync event:', error);
    }
}

/**
 * Listens to new events from Firebase and applies them to the local Zustand store.
 */
export function startSyncListener() {
    const eventsRef = collection(db, 'family_events');
    // Listen to the most recent 10 events to catch real-time updates
    const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(10));

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            // Only care about newly added events while we are listening
            if (change.type === 'added') {
                const event = change.doc.data() as SyncEvent;

                // Ignore our own events (we already applied them locally)
                if (event.origin === originId) return;
                // Ignore events without a proper timestamp (can happen during local optimistic writes)
                if (!event.timestamp) return;

                const data = JSON.parse(event.payload);
                const store = useStore.getState();

                switch (event.type) {
                    case 'TASK_ADDED':
                        // Check if it already exists to avoid duplicates
                        if (!store.tasks.find(t => t.id === data.id)) {
                            store.addTask(data);
                        }
                        break;
                    case 'TASK_UPDATED':
                        store.updateTask(data.id, data.updates);
                        break;
                    case 'TASK_REMOVED':
                        store.removeTask(data.id);
                        break;
                    case 'WALL_POSTED':
                        if (!store.wallPosts.find(p => p.id === data.id)) {
                            store.addWallPost(data);
                        }
                        break;
                    case 'XP_ADDED':
                        store.addXP(data.userId, data.amount);
                        break;
                    case 'PENALTY_ADDED':
                        store.addPenalty(data);
                        break;
                }
            }
        });
    });
}
