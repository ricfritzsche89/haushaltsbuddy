import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useStore } from '../store/useStore';

export type SyncEvent = {
    type: 'TASK_ADDED' | 'TASK_UPDATED' | 'TASK_REMOVED' | 'WALL_POSTED' | 'WALL_LIKED' | 'WALL_REACTED' | 'WALL_COMMENTED' | 'WALL_UPDATED' | 'WALL_DELETED' | 'XP_ADDED' | 'PENALTY_ADDED' | 'PENALTY_ACTIVATED' | 'PENALTY_REMOVED' | 'WEEKLY_PLAN_GENERATED' | 'USER_PROFILE_UPDATED' | 'OFFENSE_REPORT_ADDED' | 'OFFENSE_REPORT_UPDATED' | 'REMINDER_SENT' | 'SHOP_ITEM_ADDED' | 'SHOP_ITEM_UPDATED' | 'SHOP_ITEM_DELETED' | 'SHOP_ITEM_PURCHASED' | 'SHOP_PURCHASE_REDEEMED' | 'NOTIFICATION_ADDED' | 'FULL_STATE_SYNC' | 'REQUEST_FULL_SYNC' | 'TRANSACTION_ADDED' | 'TRANSACTION_STATUS_UPDATED' | 'BALANCE_ADJUSTED' | 'INVESTMENT_EVENT_ADDED' | 'INVESTMENT_EVENT_DELETED' | 'BANKING_RESET' | 'TASKS_CLEARED';
    payload: string; // JSON stringified data
    origin: string; // unique browser/device ID to avoid self-syncing
    timestamp: any;
};

// Simple unique ID for the current browser session
const originId = Math.random().toString(36).substring(2, 15);

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let lastSyncTimestamp: number = 0; // Keep track of the timestamp of the loaded master state

/**
 * Loads the Master State from Firestore when the app starts.
 */
export async function loadMasterState() {
    try {
        const docRef = doc(db, 'states', 'master');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Master State found. Loading...");

            // Apply the master state
            useStore.getState().replaceState(data.state);

            // Remember the timestamp so the event listener doesn't apply old events
            if (data.timestamp) {
                lastSyncTimestamp = data.timestamp.toMillis();
            }
            return true; // Indicates success
        } else {
            console.log("No Master State found. Using local/default state.");
            return false;
        }
    } catch (error) {
        console.error("Error loading master state:", error);
        return false;
    }
}

/**
 * Subscribes to real-time changes on the master state document.
 * This fires whenever ANY device saves a new master state, ensuring
 * all other devices update within seconds – even if the event listener
 * missed something while backgrounded.
 */
export function subscribeToMasterStateChanges() {
    const docRef = doc(db, 'states', 'master');
    return onSnapshot(docRef, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        if (!data?.timestamp) return;

        const newTimestampMs = data.timestamp.toMillis ? data.timestamp.toMillis() : data.timestamp;

        // Only apply if the update came from a different device
        if (data.origin === originId) return;

        // Only apply if it is actually newer than what we already loaded
        if (newTimestampMs <= lastSyncTimestamp) return;

        console.log("[Sync] Live master state update received – applying...");
        useStore.getState().replaceState(data.state);
        lastSyncTimestamp = newTimestampMs;
    }, (error) => {
        console.warn('[Sync] Master state listener error:', error);
    });
}

/**
 * Saves the entire current Zustand state to a central master document in Firestore.
 */
export async function saveMasterState() {
    try {
        const state = useStore.getState();
        // We only save if we actually have tasks (to prevent wiping the master state on accident)
        if (state.tasks.length === 0) return;

        // Strip massive base64 image strings from the entire state before saving
        const cleanedState = JSON.parse(JSON.stringify(state, (key, value) => {
            if ((key === 'beweisFoto' || key === 'photoUrl') && typeof value === 'string' && value.length > 2000) {
                return null;
            }
            return value;
        }));

        await setDoc(doc(db, 'states', 'master'), {
            state: cleanedState,
            timestamp: serverTimestamp(),
            origin: originId, // Keep track of who saved it
        });
        console.log("Master State saved to Firebase.");
    } catch (error) {
        console.error("Error saving master state:", error);
    }
}

/**
 * Debounced wrapper to save the master state without spamming Firestore
 */
export function debouncedSaveMasterState() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    // Save state after 2 seconds of inactivity
    saveTimeout = setTimeout(() => {
        const currentUser = useStore.getState().currentUser;
        // Optional: only let admins save the master state to be safe, or let anyone do it.
        // For max offline sync reliability, we let anyone who makes a change save it.
        if (currentUser) {
            saveMasterState();
        }
    }, 2000);
}


/**
 * Publishes an event to Firebase so other devices can sync.
 */
export async function publishEvent(type: SyncEvent['type'], data: any) {
    try {
        const eventsRef = collection(db, 'family_events');

        // Strip massive base64 image strings to strictly prevent Firestore 1MB document limit crashes
        const jsonPayload = JSON.stringify(data, (key, value) => {
            if ((key === 'beweisFoto' || key === 'photoUrl') && typeof value === 'string' && value.length > 2000) {
                return null; // Return null so the receiving device acts like there's no photo synced
            }
            return value;
        });

        await addDoc(eventsRef, {
            type,
            payload: jsonPayload,
            origin: originId,
            timestamp: serverTimestamp(),
        });

        // After every successfully published change, trigger a debounced save of the master state
        debouncedSaveMasterState();
    } catch (error) {
        console.error('Error publishing sync event:', error);
        throw error; // Let the caller know it failed
    }
}

/**
 * Listens to new events from Firebase and applies them to the local Zustand store.
 * Auto-reconnects with exponential backoff if the connection drops.
 * @param isInitialSync If true, events older than the loaded master state are skipped.
 */
export function startSyncListener(isInitialSync: boolean = false): () => void {
    let unsubscribe: (() => void) | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 5000; // Start at 5s, double each time up to 30s
    let stopped = false;

    function connect() {
        if (stopped) return;

        const eventsRef = collection(db, 'family_events');
        const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(50));

        let isFirstSnapshot = true;

        unsubscribe = onSnapshot(q, (snapshot) => {
            // Reset backoff on successful update
            retryDelay = 5000;

            // Reverse because 'desc' gives newest first, we want oldest first
            const changes = [...snapshot.docChanges()].reverse();

            changes.forEach((change) => {
                if (change.type === 'added') {
                    const event = change.doc.data() as SyncEvent;

                    if (event.origin === originId) return;
                    if (!event.timestamp) return;

                    const eventTimeMs = event.timestamp.toMillis();

                    if (isInitialSync && isFirstSnapshot && eventTimeMs <= lastSyncTimestamp) {
                        return;
                    }

                    const data = JSON.parse(event.payload);
                    const store = useStore.getState();

                    switch (event.type) {
                        case 'TASK_ADDED':
                            if (!store.tasks.find(t => t.id === data.id)) {
                                store.addTask(data);
                            }
                            break;
                        case 'WEEKLY_PLAN_GENERATED':
                            store.setTasks(data);
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
                            if (!store.penalties.find(p => p.id === data.id)) {
                                store.addPenalty(data);
                            }
                            break;
                        case 'PENALTY_ACTIVATED':
                            store.activatePenalty(data.penaltyId, data.timestamp);
                            break;
                        case 'PENALTY_REMOVED':
                            store.deletePenalty(data.penaltyId);
                            break;
                        case 'WALL_LIKED':
                            store.likePost(data.postId, data.userId);
                            break;
                        case 'WALL_REACTED':
                            store.addWallReaction(data.postId, data.userId, data.emoji);
                            break;
                        case 'WALL_COMMENTED':
                            store.addWallComment(data.postId, data.comment);
                            break;
                        case 'WALL_UPDATED':
                            store.updateWallPost(data.postId, data.updates);
                            break;
                        case 'WALL_DELETED':
                            store.deleteWallPost(data.postId);
                            break;
                        case 'USER_PROFILE_UPDATED':
                            store.updateUserProfile(data.userId, data.updates);
                            break;
                        case 'OFFENSE_REPORT_ADDED':
                            if (!store.offenseReports.find(r => r.id === data.id)) {
                                store.addOffenseReport(data);
                            }
                            break;
                        case 'OFFENSE_REPORT_UPDATED':
                            store.updateOffenseReport(data.reportId, data.updates);
                            break;
                        case 'REMINDER_SENT':
                            store.markReminderSent(data.reminderKey);
                            break;
                        case 'SHOP_ITEM_ADDED':
                            if (!store.shopItems.find(i => i.id === data.id)) {
                                store.addShopItem(data);
                            }
                            break;
                        case 'SHOP_ITEM_UPDATED':
                            store.updateShopItem(data.itemId, data.updates);
                            break;
                        case 'SHOP_ITEM_DELETED':
                            store.deleteShopItem(data.itemId);
                            break;
                        case 'SHOP_ITEM_PURCHASED':
                            store.purchaseItem(data.userId, data.itemId, data.cost);
                            const stateAfterPurchase = useStore.getState();
                            const justPurchased = stateAfterPurchase.purchases.find(
                                p => p.itemId === data.itemId && p.userId === data.userId && p.status === 'pending'
                            );
                            if (justPurchased) {
                                justPurchased.id = data.purchaseId;
                            }
                            break;
                        case 'SHOP_PURCHASE_REDEEMED':
                            store.redeemPurchase(data.purchaseId);
                            break;
                        case 'NOTIFICATION_ADDED':
                            store.addNotification(data.notification);
                            break;
                        case 'FULL_STATE_SYNC':
                            store.replaceState(data);
                            break;
                        case 'TRANSACTION_ADDED':
                            if (!store.transactions.find(t => t.id === data.id)) {
                                store.addTransaction(data);
                            }
                            break;
                        case 'TRANSACTION_STATUS_UPDATED':
                            store.updateTransactionStatus(data.transactionId, data.status, data.adminId);
                            break;
                        case 'BALANCE_ADJUSTED':
                            store.adjustBalance(data.userId, data.amount);
                            break;
                        case 'INVESTMENT_EVENT_ADDED':
                            if (!store.investmentEvents.find(e => e.id === data.id)) {
                                store.addInvestmentEvent(data);
                            }
                            break;
                        case 'INVESTMENT_EVENT_DELETED':
                            store.deleteInvestmentEvent(data.eventId);
                            break;
                        case 'BANKING_RESET':
                            store.resetBanking();
                            break;
                        case 'TASKS_CLEARED':
                            store.clearTasks();
                            break;
                    }
                }
            });

            isFirstSnapshot = false;
        }, (error) => {
            // On error: clean up and auto-reconnect with backoff
            console.warn(`[Sync] Event listener error, retrying in ${retryDelay / 1000}s:`, error.message);
            unsubscribe?.();
            unsubscribe = null;

            if (!stopped) {
                retryTimeout = setTimeout(() => {
                    retryDelay = Math.min(retryDelay * 2, 30000);
                    connect();
                }, retryDelay);
            }
        });
    }

    connect();

    // Return a combined cleanup function
    return () => {
        stopped = true;
        if (retryTimeout) clearTimeout(retryTimeout);
        unsubscribe?.();
    };
}

