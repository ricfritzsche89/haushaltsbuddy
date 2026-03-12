import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Task, UserProfile, Reward, WallPost, Penalty, OffenseReport, 
  UserId, DayOfWeek, TaskTemplate, DashboardViewMode, ShopItem, 
  RewardPurchase, InAppNotification, Appointment, Transaction, 
  TransactionStatus, InvestmentEvent 
} from '../types';
import { ALLE_TITEL } from '../types';

interface AppState {
    users: Record<UserId, UserProfile>;
    tasks: Task[];
    taskTemplates: TaskTemplate[];
    rewards: Reward[];
    wallPosts: WallPost[];
    penalties: Penalty[];
    offenseReports: OffenseReport[];
    shopItems: ShopItem[];
    purchases: RewardPurchase[];
    notifications: InAppNotification[];
    appointments: Appointment[];
    transactions: Transaction[]; // Added
    investmentEvents: InvestmentEvent[]; // New
    lastReminders: Record<string, boolean>; // Key: YYYY-MM-DD-HH, Value: true if sent
    currentUser: UserId | null;
    setCurrentUser: (id: UserId | null) => void;
    updateUserAvailability: (id: UserId, availability: UserProfile['availability']) => void;
    updateUserProfile: (id: UserId, updates: Partial<UserProfile>) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    removeTask: (taskId: string) => void;
    moveTask: (taskId: string, newDay: DayOfWeek) => void;
    addComment: (taskId: string, comment: any) => void;
    setTasks: (tasks: Task[]) => void;
    clearTasks: () => void;

    // Template Management
    addTaskTemplate: (template: TaskTemplate) => void;
    updateTaskTemplate: (templateId: string, updates: Partial<TaskTemplate>) => void;
    removeTaskTemplate: (templateId: string) => void;

    addXP: (userId: UserId, amount: number) => void;
    addWallPost: (post: WallPost) => void;
    likePost: (postId: string, userId: UserId) => void;
    addWallReaction: (postId: string, userId: UserId, emoji: string) => void;
    addWallComment: (postId: string, comment: any) => void;
    deleteWallPost: (postId: string) => void;
    updateWallPost: (postId: string, updates: Partial<WallPost>) => void;
    addPenalty: (penalty: Penalty) => void;
    deletePenalty: (penaltyId: string) => void;
    activatePenalty: (penaltyId: string, timestamp: number) => void;
    addOffenseReport: (report: OffenseReport) => void;
    updateOffenseReport: (reportId: string, updates: Partial<OffenseReport>) => void;
    deleteOffenseReport: (reportId: string) => void;

    // Shop
    addShopItem: (item: ShopItem) => void;
    updateShopItem: (itemId: string, updates: Partial<ShopItem>) => void;
    deleteShopItem: (itemId: string) => void;
    purchaseItem: (userId: UserId, itemId: string, cost: number) => void;
    redeemPurchase: (purchaseId: string) => void;

    // Notifications
    addNotification: (notification: InAppNotification) => void;
    markNotificationAsRead: (notificationId: string) => void;
    markAllNotificationsAsRead: (userId: UserId) => void;

    // Appointments
    addAppointment: (appointment: Appointment) => void;
    updateAppointment: (id: string, updates: Partial<Appointment>) => void;
    deleteAppointment: (id: string) => void;

    // Transactions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => void;
    updateTransactionStatus: (transactionId: string, status: TransactionStatus, adminId: UserId) => void;
    adjustBalance: (userId: UserId, amount: number) => void;

    // Investment Events
    addInvestmentEvent: (event: Omit<InvestmentEvent, 'id' | 'createdAt'>) => void;
    deleteInvestmentEvent: (eventId: string) => void;

    clearOldPhotos: () => void;
    markReminderSent: (reminderKey: string) => void;
    syncState: (newState: any) => void;
    setPin: (userId: UserId, pin: string) => void;
    setDarkMode: (userId: UserId, isDark: boolean) => void;
    setDashboardView: (userId: UserId, view: DashboardViewMode) => void;
    setActiveTitle: (userId: UserId, titleId: string) => void;
    checkUserTitles: (userId: UserId) => void;
    resetUserXP: (userId: UserId) => void;
    migrateTylerToTayler: () => void;
    resetAllPins: () => void;
    resetBanking: () => void;
    recordDayCompletion: (userId: UserId) => void;
    ensureAdminRoles: () => void;
    // This function allows replacing the entire state when a full sync from another device happens
    replaceState: (newState: Partial<AppState>) => void;
}

const initialUsers: Record<UserId, UserProfile> = {
    Ric: { id: 'Ric', name: 'Ric', role: 'admin', color: '#3b82f6', availability: 'available', xp: 0, balance: 0, activeTitle: 'chef', unlockedTitles: ['chef'], pin: '7602' },
    Nadine: { id: 'Nadine', name: 'Nadine', role: 'admin', color: '#ec4899', availability: 'available', xp: 0, balance: 0, activeTitle: 'chefin', unlockedTitles: ['chefin'], pin: '0815' },
    Tayler: { id: 'Tayler', name: 'Tayler', role: 'user', color: '#10b981', availability: 'available', xp: 0, balance: 0, activeTitle: 'lauch', unlockedTitles: ['lauch'], pin: '1234' },
    Fee: { id: 'Fee', name: 'Fee', role: 'user', color: '#a855f7', availability: 'available', xp: 0, balance: 0, activeTitle: 'igelschnautzchen', unlockedTitles: ['igelschnautzchen'], pin: '1234' },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialTaskTemplates: TaskTemplate[] = [
    // WÄSCHE
    { id: generateId(), titel: 'Wäsche waschen', raum: 'Verschiedenes', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'nach_bedarf', festeZuweisung: 'Ric' },
    { id: generateId(), titel: 'Wäsche aufhängen', raum: 'Verschiedenes', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'nach_bedarf' },
    { id: generateId(), titel: 'Wäsche abhängen', raum: 'Verschiedenes', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 15, frequenz: 'nach_bedarf' },
    { id: generateId(), titel: 'Wäsche sortieren', raum: 'Verschiedenes', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'nach_bedarf', festeZuweisung: 'Nadine' },

    // KINDERZIMMER Täglich
    { id: generateId(), titel: 'Geschirr aus dem Zimmer in Küche bringen', raum: 'Kinderzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich' },
    { id: generateId(), titel: 'Zimmer aufräumen', raum: 'Kinderzimmer', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Wäsche runterbringen', raum: 'Kinderzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich' },

    // KINDERZIMMER Wöchentlich
    { id: generateId(), titel: 'Zimmer richtig aufräumen', raum: 'Kinderzimmer', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: '2x_woche' },
    { id: generateId(), titel: 'Saugen + Wischen', raum: 'Kinderzimmer', beschreibung: '', schwierigkeitspunkte: 4, xpBelohnung: 40, frequenz: '1x_woche' },

    // FLUR / TREPPE
    { id: generateId(), titel: 'Bodentreppe kehren', raum: 'Flur', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 15, frequenz: 'täglich' },
    { id: generateId(), titel: 'Vorraum aufräumen', raum: 'Flur', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'nach_bedarf' },
    { id: generateId(), titel: 'Treppe kehren', raum: 'Flur', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'alle_3_tage' },

    // SCHLAFZIMMER
    { id: generateId(), titel: 'Geschirr rausbringen', raum: 'Schlafzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich' },
    { id: generateId(), titel: 'Wäsche rausbringen', raum: 'Schlafzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich' },
    { id: generateId(), titel: 'Müll rausbringen (Schlafzimmer)', raum: 'Schlafzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich' },
    { id: generateId(), titel: 'Bettwäsche wechseln', raum: 'Schlafzimmer', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: '1x_monat', festeZuweisung: 'Nadine' },

    // ALLGEMEINE AUFGABEN
    { id: generateId(), titel: 'Fenster putzen', raum: 'Ganzes Haus', beschreibung: '', schwierigkeitspunkte: 5, xpBelohnung: 50, frequenz: 'nach_bedarf' },
    { id: generateId(), titel: 'Blumen gießen', raum: 'Ganzes Haus', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'nach_bedarf' },
    { id: generateId(), titel: 'Einkaufen', raum: 'Außer Haus', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: 'nach_bedarf' },
    { id: generateId(), titel: 'Kühlschrank Ordnung machen', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'nach_bedarf' },
    { id: generateId(), titel: 'Dinge entsorgen', raum: 'Verschiedenes', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'nach_bedarf', festeZuweisung: 'Ric' }, // Added Nadine+Ric logically via one or another, assign Ric for now since UI doesn't support multiple yet

    // PC ABTEIL
    { id: generateId(), titel: 'PC Abteil aufräumen', raum: 'Arbeitsbereich', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: '2x_woche' },

    // TERRASSE
    { id: generateId(), titel: 'Tisch aufräumen', raum: 'Terrasse', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich' },
    { id: generateId(), titel: 'Terrasse komplett aufräumen', raum: 'Terrasse', beschreibung: '', schwierigkeitspunkte: 4, xpBelohnung: 40, frequenz: '1x_woche' },

    // WOHNZIMMER
    { id: generateId(), titel: 'Tische abräumen', raum: 'Wohnzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich' },
    { id: generateId(), titel: 'Tische abwischen', raum: 'Wohnzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 15, frequenz: 'täglich' },
    { id: generateId(), titel: 'Rumliegende Dinge aufräumen', raum: 'Wohnzimmer', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Sofa ordentlich machen', raum: 'Wohnzimmer', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 15, frequenz: 'täglich' },
    { id: generateId(), titel: 'Sofa + Boden saugen', raum: 'Wohnzimmer', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: '2x_woche' },
    { id: generateId(), titel: 'Wischen (Wohnzimmer)', raum: 'Wohnzimmer', beschreibung: '', schwierigkeitspunkte: 4, xpBelohnung: 40, frequenz: '1x_woche' },

    // KÜCHE
    { id: generateId(), titel: 'Spüler einräumen', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Spüler ausräumen', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Großes Geschirr abwaschen', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: 'täglich' },
    { id: generateId(), titel: 'Arbeitsflächen aufräumen', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Arbeitsflächen abwischen', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Katzenklo reinigen', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Lucky füttern', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 1, xpBelohnung: 10, frequenz: 'täglich', festeZuweisung: 'Ric' },
    { id: generateId(), titel: 'Saugen (Küche)', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: '2x_woche' },
    { id: generateId(), titel: 'Wischen (Küche)', raum: 'Küche', beschreibung: '', schwierigkeitspunkte: 4, xpBelohnung: 40, frequenz: '2x_woche' },

    // BAD & TOILETTE
    { id: generateId(), titel: 'Toilette putzen', raum: 'Toilette', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: '2x_woche', festeZuweisung: 'Nadine' },
    { id: generateId(), titel: 'Waschbecken sauber machen', raum: 'Bad', beschreibung: '', schwierigkeitspunkte: 2, xpBelohnung: 20, frequenz: 'täglich' },
    { id: generateId(), titel: 'Dusche putzen', raum: 'Bad', beschreibung: '', schwierigkeitspunkte: 4, xpBelohnung: 40, frequenz: '2x_woche' },
    { id: generateId(), titel: 'Saugen (Bad)', raum: 'Bad', beschreibung: '', schwierigkeitspunkte: 3, xpBelohnung: 30, frequenz: '2x_woche' },
    { id: generateId(), titel: 'Wischen (Bad)', raum: 'Bad', beschreibung: '', schwierigkeitspunkte: 4, xpBelohnung: 40, frequenz: '1x_woche' },
];

const initialShopItems: ShopItem[] = [
    { id: generateId(), name: '1 Stunde länger wach bleiben', description: 'Gilt am Wochenende', cost: 150, emoji: '🦉' },
    { id: generateId(), name: 'Lieblingsessen wünschen', description: 'Ein Wunschgericht fürs Wochenende', cost: 300, emoji: '🍕' },
    { id: generateId(), name: 'Aufgaben-Joker', description: 'Befreit dich von einer ungeliebten Aufgabe', cost: 500, emoji: '🃏' },
    { id: generateId(), name: 'Kinoabend', description: 'Filmabend mit Popcorn zu Hause', cost: 600, emoji: '🍿' },
];

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            users: initialUsers,
            tasks: [],
            taskTemplates: initialTaskTemplates,
            rewards: [],
            wallPosts: [],
            penalties: [],
            offenseReports: [],
            shopItems: initialShopItems,
            purchases: [],
            notifications: [],
            appointments: [],
            transactions: [], // Added
            investmentEvents: [], // New
            lastReminders: {},
            currentUser: null,

            setCurrentUser: (id) => set({ currentUser: id }),

            updateUserAvailability: (id, availability) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [id]: { ...state.users[id], availability },
                    },
                })),

            updateUserProfile: (id, updates) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [id]: { ...state.users[id], ...updates },
                    },
                })),

            addTask: (task) => {
                let newTask = { ...task };
                if (newTask.zugewiesenerNutzer === ('Tyler' as any)) newTask.zugewiesenerNutzer = 'Tayler';
                if (newTask.festeZuweisung === ('Tyler' as any)) newTask.festeZuweisung = 'Tayler';
                set((state) => ({
                    tasks: [...state.tasks, newTask],
                }));
            },

            updateTask: (taskId, updates) =>
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
                })),

            removeTask: (taskId) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== taskId),
                })),

            moveTask: (taskId, newDay) =>
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, wochentag: newDay } : t)),
                })),

            addComment: (taskId, comment) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId ? { ...t, kommentare: [...t.kommentare, comment] } : t
                    ),
                })),

            setTasks: (tasks) => {
                const normalizedTasks = tasks.map(t => {
                    let newT = { ...t };
                    if (newT.zugewiesenerNutzer === ('Tyler' as any)) newT.zugewiesenerNutzer = 'Tayler';
                    if (newT.festeZuweisung === ('Tyler' as any)) newT.festeZuweisung = 'Tayler';
                    if (newT.kommentare) {
                        newT.kommentare = newT.kommentare.map(c => c.userId === ('Tyler' as any) ? { ...c, userId: 'Tayler' } : c);
                    }
                    return newT;
                });
                set({ tasks: normalizedTasks });
            },

            clearTasks: () => set({ tasks: [] }),

            addTaskTemplate: (template) =>
                set((state) => ({
                    taskTemplates: [...state.taskTemplates, template],
                })),

            updateTaskTemplate: (templateId, updates) =>
                set((state) => ({
                    taskTemplates: state.taskTemplates.map((t) => (t.id === templateId ? { ...t, ...updates } : t)),
                })),

            removeTaskTemplate: (templateId) =>
                set((state) => ({
                    taskTemplates: state.taskTemplates.filter((t) => t.id !== templateId),
                })),

            addXP: (userId, amount) =>
                set((state) => {
                    const user = state.users[userId];
                    const newXp = user.xp + amount;

                    // Auto-unlock Titel die durch neue XP freigeschaltet werden
                    const currentUnlocked = user.unlockedTitles || [];
                    const newlyUnlocked = ALLE_TITEL
                        .filter(t => t.xpRequired > 0 && t.xpRequired <= newXp && !currentUnlocked.includes(t.id))
                        .map(t => t.id);

                    return {
                        users: {
                            ...state.users,
                            [userId]: {
                                ...user,
                                xp: newXp,
                                unlockedTitles: [...currentUnlocked, ...newlyUnlocked],
                            },
                        },
                    };
                }),

            addWallPost: (post) =>
                set((state) => ({
                    wallPosts: [post, ...state.wallPosts],
                })),

            likePost: (postId, userId) =>
                set((state) => ({
                    wallPosts: state.wallPosts.map(p => {
                        if (p.id !== postId) return p;
                        const alreadyLiked = p.likes.includes(userId);
                        return {
                            ...p,
                            likes: alreadyLiked
                                ? p.likes.filter(id => id !== userId)
                                : [...p.likes, userId]
                        };
                    })
                })),

            addWallReaction: (postId, userId, emoji) =>
                set((state) => ({
                    wallPosts: state.wallPosts.map(p => {
                        if (p.id !== postId) return p;

                        // Initialize reactions if empty
                        const reactions = p.reactions ? { ...p.reactions } : {};
                        const userReactionsForEmoji = reactions[emoji] || [];

                        if (userReactionsForEmoji.includes(userId)) {
                            // Remove reaction
                            reactions[emoji] = userReactionsForEmoji.filter(id => id !== userId);
                            // Cleanup empty arrays
                            if (reactions[emoji].length === 0) {
                                delete reactions[emoji];
                            }
                        } else {
                            // Add reaction
                            reactions[emoji] = [...userReactionsForEmoji, userId];
                        }

                        return { ...p, reactions };
                    })
                })),

            addWallComment: (postId, comment) =>
                set((state) => ({
                    wallPosts: state.wallPosts.map(p =>
                        p.id === postId
                            ? { ...p, comments: [...p.comments, comment] }
                            : p
                    )
                })),

            deleteWallPost: (postId) =>
                set((state) => ({
                    wallPosts: state.wallPosts.filter(p => p.id !== postId)
                })),

            updateWallPost: (postId, updates) =>
                set((state) => ({
                    wallPosts: state.wallPosts.map(p =>
                        p.id === postId ? { ...p, ...updates } : p
                    )
                })),

            addPenalty: (penalty) =>
                set((state) => ({
                    penalties: [penalty, ...state.penalties],
                })),

            deletePenalty: (penaltyId) =>
                set((state) => ({
                    penalties: state.penalties.filter(p => p.id !== penaltyId)
                })),

            activatePenalty: (penaltyId, timestamp) =>
                set((state) => ({
                    penalties: state.penalties.map(p =>
                        p.id === penaltyId ? { ...p, activatedAt: timestamp } : p
                    )
                })),

            addOffenseReport: (report) =>
                set((state) => ({
                    offenseReports: [report, ...state.offenseReports],
                })),

            updateOffenseReport: (reportId, updates) =>
                set((state) => ({
                    offenseReports: state.offenseReports.map(r =>
                        r.id === reportId ? { ...r, ...updates } : r
                    )
                })),

            deleteOffenseReport: (reportId) =>
                set((state) => ({
                    offenseReports: state.offenseReports.filter(r => r.id !== reportId)
                })),

            addShopItem: (item) => set(state => ({ shopItems: [...state.shopItems, item] })),
            updateShopItem: (itemId, updates) => set(state => ({
                shopItems: state.shopItems.map(i => i.id === itemId ? { ...i, ...updates } : i)
            })),
            deleteShopItem: (itemId) => set(state => ({
                shopItems: state.shopItems.filter(i => i.id !== itemId)
            })),
            purchaseItem: (userId, itemId, cost) => set(state => {
                const user = state.users[userId];
                if (user.xp < cost) return state; // Safety check

                const newPurchase: RewardPurchase = {
                    id: generateId(),
                    userId,
                    itemId,
                    timestamp: Date.now(),
                    status: 'pending'
                };

                return {
                    // deduct cost
                    users: {
                        ...state.users,
                        [userId]: { ...user, xp: user.xp - cost }
                    },
                    purchases: [newPurchase, ...state.purchases]
                };
            }),
            redeemPurchase: (purchaseId) => set(state => ({
                purchases: state.purchases.map(p => p.id === purchaseId ? { ...p, status: 'redeemed' } : p)
            })),

            addNotification: (notification) => set(state => ({
                notifications: [notification, ...state.notifications]
            })),
            markNotificationAsRead: (notificationId) => set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            })),
            markAllNotificationsAsRead: (userId) =>
                set((state) => ({
                    notifications: state.notifications.map(n => n.userId === userId ? { ...n, read: true } : n)
                })),

            // Appointments
            addAppointment: (appointment) =>
                set((state) => ({
                    appointments: [...state.appointments, appointment]
                })),

            updateAppointment: (id, updates) =>
                set((state) => ({
                    appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a)
                })),

            deleteAppointment: (id) =>
                set((state) => ({
                    appointments: state.appointments.filter(a => a.id !== id)
                })),

            // Transactions
            addTransaction: (transactionData) => {
                const newTransaction: Transaction = {
                    ...transactionData,
                    id: generateId(),
                    timestamp: Date.now(),
                    status: 'pending', // Both deposit and withdrawal start as pending for admin confirmation
                };

                set((state) => ({
                    transactions: [newTransaction, ...state.transactions]
                }));
            },

            updateTransactionStatus: (transactionId, status, adminId) => {
                set((state) => {
                    const trans = state.transactions.find(t => t.id === transactionId);
                    if (!trans || trans.status !== 'pending') return state;

                    const updatedTransactions = state.transactions.map(t =>
                        t.id === transactionId ? { ...t, status, handledBy: adminId, handledAt: Date.now() } : t
                    );

                    const updatedUsers = { ...state.users };
                    if (status === 'completed') {
                        const user = updatedUsers[trans.userId];
                        if (user) {
                            // Apply money change
                            const modifier = trans.type === 'deposit' ? 1 : -1;
                            updatedUsers[trans.userId] = {
                                ...user,
                                balance: (user.balance || 0) + (trans.amount * modifier)
                            };
                        }
                    }

                    return {
                        transactions: updatedTransactions,
                        users: updatedUsers
                    };
                });
            },

            adjustBalance: (userId, amount) => {
                set((state) => {
                    const user = state.users[userId];
                    if (!user) return state;

                    const newTransaction: Transaction = {
                        id: generateId(),
                        userId,
                        amount,
                        type: 'adjustment',
                        status: 'completed',
                        reason: 'Manuelle Korrektur durch Admin',
                        timestamp: Date.now(),
                        handledBy: state.currentUser || 'System',
                        handledAt: Date.now()
                    };

                    return {
                        users: {
                            ...state.users,
                            [userId]: { ...user, balance: (user.balance || 0) + amount }
                        },
                        transactions: [newTransaction, ...state.transactions]
                    };
                });
            },

            addInvestmentEvent: (eventData) => {
                const newEvent: InvestmentEvent = {
                    ...eventData,
                    id: generateId(),
                    createdAt: Date.now(),
                };
                set((state) => ({
                    investmentEvents: [newEvent, ...state.investmentEvents]
                }));
            },

            deleteInvestmentEvent: (eventId) => {
                set((state) => ({
                    investmentEvents: state.investmentEvents.filter(e => e.id !== eventId)
                }));
            },

            // Clears base64 proof photos older than today at midnight (avatarUrl exempt)
            clearOldPhotos: () =>
                set((state) => {
                    const midnightToday = new Date();
                    midnightToday.setHours(0, 0, 0, 0);
                    const cutoff = midnightToday.getTime();
                    return {
                        tasks: state.tasks.map(t =>
                            t.erstelltAm < cutoff ? { ...t, beweisFoto: null } : t
                        ),
                        penalties: state.penalties.map(p =>
                            p.timestamp < cutoff ? { ...p, photoUrl: undefined } : p
                        ),
                        offenseReports: state.offenseReports.map(r =>
                            r.timestamp < cutoff ? { ...r, photoUrl: undefined } : r
                        ),
                    };
                }),

            markReminderSent: (reminderKey) =>
                set((state) => ({
                    lastReminders: { ...state.lastReminders, [reminderKey]: true }
                })),

            checkUserTitles: (userId) =>
                set((state) => {
                    const user = state.users[userId];
                    if (!user) return {};

                    const currentUnlocked = user.unlockedTitles || [];
                    // Finde alle Titel mit 0 XP die entweder für alle sind oder speziell für diesen User
                    const baseTitles = ALLE_TITEL
                        .filter(t => t.xpRequired === 0 && (!t.nurFuerUser || t.nurFuerUser === userId))
                        .map(t => t.id);

                    const missing = baseTitles.filter(id => !currentUnlocked.includes(id));

                    if (missing.length === 0) return {};

                    return {
                        users: {
                            ...state.users,
                            [userId]: {
                                ...user,
                                unlockedTitles: [...currentUnlocked, ...missing]
                            }
                        }
                    };
                }),

            resetUserXP: (userId) =>
                set((state) => {
                    const user = state.users[userId];
                    if (!user) return {};

                    const baseTitles = ALLE_TITEL
                        .filter(t => t.xpRequired === 0 && (!t.nurFuerUser || t.nurFuerUser === userId))
                        .map(t => t.id);

                    return {
                        users: {
                            ...state.users,
                            [userId]: {
                                ...user,
                                xp: 0,
                                unlockedTitles: baseTitles,
                                activeTitle: baseTitles[0] || undefined
                            }
                        }
                    };
                }),

            migrateTylerToTayler: () =>
                set((state) => {
                    let changed = false;
                    const newState: any = { ...state };

                    // Migrate user obj
                    const oldUser = newState.users['Tyler'];
                    if (oldUser) {
                        newState.users = { ...newState.users };
                        newState.users['Tayler'] = {
                            ...oldUser,
                            id: 'Tayler',
                            name: 'Tayler'
                        };
                        delete newState.users['Tyler'];
                        changed = true;
                    }

                    // Migrate current user
                    if (newState.currentUser === 'Tyler') {
                        newState.currentUser = 'Tayler';
                        changed = true;
                    }

                    // Migrate tasks
                    if (newState.tasks) {
                        let tasksChanged = false;
                        const newTasks = newState.tasks.map((t: any) => {
                            let newT = { ...t };
                            let tChanged = false;
                            if (newT.zugewiesenerNutzer === 'Tyler') { newT.zugewiesenerNutzer = 'Tayler'; tChanged = true; }
                            if (newT.festeZuweisung === 'Tyler') { newT.festeZuweisung = 'Tayler'; tChanged = true; }
                            if (newT.kommentare && newT.kommentare.some((c: any) => c.userId === 'Tyler')) {
                                newT.kommentare = newT.kommentare.map((c: any) => c.userId === 'Tyler' ? { ...c, userId: 'Tayler' } : c);
                                tChanged = true;
                            }
                            if (tChanged) tasksChanged = true;
                            return newT;
                        });
                        if (tasksChanged) { newState.tasks = newTasks; changed = true; }
                    }

                    // Migrate penalties
                    if (newState.penalties) {
                        let penChanged = false;
                        const newPens = newState.penalties.map((p: any) => {
                            let newP = { ...p };
                            let pChanged = false;
                            if (newP.userId === 'Tyler') { newP.userId = 'Tayler'; pChanged = true; }
                            if (newP.issuedBy === 'Tyler') { newP.issuedBy = 'Tayler'; pChanged = true; }
                            if (pChanged) penChanged = true;
                            return newP;
                        });
                        if (penChanged) { newState.penalties = newPens; changed = true; }
                    }

                    // Migrate Offense Reports
                    if (newState.offenseReports) {
                        let offChanged = false;
                        const newOffs = newState.offenseReports.map((r: any) => {
                            let newR = { ...r };
                            let rChanged = false;
                            if (newR.reportedBy === 'Tyler') { newR.reportedBy = 'Tayler'; rChanged = true; }
                            if (newR.reportedUser === 'Tyler') { newR.reportedUser = 'Tayler'; rChanged = true; }
                            if (rChanged) offChanged = true;
                            return newR;
                        });
                        if (offChanged) { newState.offenseReports = newOffs; changed = true; }
                    }

                    // Migrate Wall Posts
                    if (newState.wallPosts) {
                        let wallChanged = false;
                        const newWalls = newState.wallPosts.map((wp: any) => {
                            let newW = { ...wp };
                            let wChanged = false;
                            if (newW.userId === 'Tyler') { newW.userId = 'Tayler'; wChanged = true; }
                            if (newW.likes && newW.likes.includes('Tyler')) {
                                newW.likes = newW.likes.map((l: any) => l === 'Tyler' ? 'Tayler' : l);
                                wChanged = true;
                            }
                            if (newW.comments && newW.comments.some((c: any) => c.userId === 'Tyler')) {
                                newW.comments = newW.comments.map((c: any) => c.userId === 'Tyler' ? { ...c, userId: 'Tayler' } : c);
                                wChanged = true;
                            }
                            if (wChanged) wallChanged = true;
                            return newW;
                        });
                        if (wallChanged) { newState.wallPosts = newWalls; changed = true; }
                    }

                    return changed ? newState : state;
                }),

            syncState: (newState) => set((state) => ({ ...state, ...newState })),
            setPin: (userId, pin) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: { ...state.users[userId], pin },
                    },
                })),
            resetAllPins: () => set((state) => {
                const updatedUsers = { ...state.users };
                if (updatedUsers['Ric']) updatedUsers['Ric'] = { ...updatedUsers['Ric'], pin: '7602' };
                if (updatedUsers['Nadine']) updatedUsers['Nadine'] = { ...updatedUsers['Nadine'], pin: '0815' };
                if (updatedUsers['Tayler']) updatedUsers['Tayler'] = { ...updatedUsers['Tayler'], pin: '1234' };
                if (updatedUsers['Fee']) updatedUsers['Fee'] = { ...updatedUsers['Fee'], pin: '1234' };
                return { users: updatedUsers };
            }),

            resetBanking: () => set((state) => {
                const updatedUsers = { ...state.users };
                Object.keys(updatedUsers).forEach(id => {
                    updatedUsers[id as UserId] = {
                        ...updatedUsers[id as UserId],
                        balance: 0
                    };
                });
                return {
                    transactions: [],
                    users: updatedUsers
                };
            }),

            setDarkMode: (userId, isDark) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: { ...state.users[userId], darkMode: isDark },
                    },
                })),

            setDashboardView: (userId, view) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: { ...state.users[userId], dashboardView: view },
                    },
                })),

            setActiveTitle: (userId, titleId) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: { ...state.users[userId], activeTitle: titleId },
                    },
                })),

            recordDayCompletion: (userId) => set((state) => {
                const today = new Date().toISOString().split('T')[0];
                const user = state.users[userId];
                if (!user) return {};
                if (user.lastStreakDate === today) return {}; // already counted today

                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const isConsecutive = user.lastStreakDate === yesterday;

                const newStreak = isConsecutive ? (user.streak || 0) + 1 : 1;
                const newLongest = Math.max(newStreak, user.longestStreak || 0);

                return {
                    users: {
                        ...state.users,
                        [userId]: {
                            ...user,
                            streak: newStreak,
                            longestStreak: newLongest,
                            lastStreakDate: today,
                        },
                    },
                };
            }),

            ensureAdminRoles: () => set((state) => {
                const updatedUsers = { ...state.users };
                let changed = false;
                if (updatedUsers['Ric'] && updatedUsers['Ric'].role !== 'admin') {
                    updatedUsers['Ric'] = { ...updatedUsers['Ric'], role: 'admin' };
                    changed = true;
                }
                if (updatedUsers['Nadine'] && updatedUsers['Nadine'].role !== 'admin') {
                    updatedUsers['Nadine'] = { ...updatedUsers['Nadine'], role: 'admin' };
                    changed = true;
                }
                return changed ? { users: updatedUsers } : {};
            }),

            replaceState: (newState) => set((state) => ({
                ...state,
                users: (() => {
                    if (!newState.users) return state.users;
                    const merged = { ...state.users };
                    for (const id in newState.users) {
                        merged[id as UserId] = {
                            ...newState.users[id as UserId],
                            balance: newState.users[id as UserId].balance ?? (state.users[id as UserId]?.balance || 0),
                            dashboardView: state.users[id as UserId]?.dashboardView || newState.users[id as UserId].dashboardView,
                            dashboardFilter: state.users[id as UserId]?.dashboardFilter || newState.users[id as UserId].dashboardFilter,
                        };
                    }
                    return merged;
                })(),
                tasks: newState.tasks || state.tasks,
                taskTemplates: newState.taskTemplates || state.taskTemplates,
                rewards: newState.rewards || state.rewards,
                wallPosts: newState.wallPosts || state.wallPosts,
                penalties: newState.penalties || state.penalties,
                offenseReports: newState.offenseReports || state.offenseReports,
                shopItems: newState.shopItems || state.shopItems,
                purchases: newState.purchases || state.purchases,
                appointments: newState.appointments || state.appointments,
                transactions: newState.transactions || state.transactions, // Added
                investmentEvents: newState.investmentEvents || state.investmentEvents, // New
                // Do not override currentUser, lastReminders or other local UI states
            })),
        }),
        {
            name: 'haushalts-buddy-storage',
        }
    )
);
