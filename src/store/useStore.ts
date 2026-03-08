import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, UserProfile, Reward, WallPost, Penalty, UserId, DayOfWeek } from '../types';

interface AppState {
    users: Record<UserId, UserProfile>;
    tasks: Task[];
    rewards: Reward[];
    wallPosts: WallPost[];
    penalties: Penalty[];
    currentUser: UserId | null;
    setCurrentUser: (id: UserId | null) => void;
    updateUserAvailability: (id: UserId, availability: UserProfile['availability']) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    removeTask: (taskId: string) => void;
    moveTask: (taskId: string, newDay: DayOfWeek) => void;
    addComment: (taskId: string, comment: any) => void;
    setTasks: (tasks: Task[]) => void;
    addXP: (userId: UserId, amount: number) => void;
    addWallPost: (post: WallPost) => void;
    addPenalty: (penalty: Penalty) => void;
    syncState: (newState: any) => void;
    setPin: (userId: UserId, pin: string) => void;
    setDarkMode: (userId: UserId, isDark: boolean) => void;
    // This function allows replacing the entire state when a full sync from another device happens
    replaceState: (newState: Partial<AppState>) => void;
}

const initialUsers: Record<UserId, UserProfile> = {
    Ric: { id: 'Ric', name: 'Ric', role: 'admin', color: '#3b82f6', availability: 'available', xp: 0 },
    Nadine: { id: 'Nadine', name: 'Nadine', role: 'user', color: '#ec4899', availability: 'available', xp: 0 },
    Tyler: { id: 'Tyler', name: 'Tyler', role: 'user', color: '#10b981', availability: 'available', xp: 0 },
    Fee: { id: 'Fee', name: 'Fee', role: 'user', color: '#a855f7', availability: 'available', xp: 0 },
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            users: initialUsers,
            tasks: [],
            rewards: [],
            wallPosts: [],
            penalties: [],
            currentUser: null,

            setCurrentUser: (id) => set({ currentUser: id }),

            updateUserAvailability: (id, availability) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [id]: { ...state.users[id], availability },
                    },
                })),

            addTask: (task) =>
                set((state) => ({
                    tasks: [...state.tasks, task],
                })),

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

            setTasks: (tasks) => set({ tasks }),

            addXP: (userId, amount) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: { ...state.users[userId], xp: state.users[userId].xp + amount },
                    },
                })),

            addWallPost: (post) =>
                set((state) => ({
                    wallPosts: [post, ...state.wallPosts],
                })),

            addPenalty: (penalty) =>
                set((state) => ({
                    penalties: [penalty, ...state.penalties],
                })),

            syncState: (newState) => set((state) => ({ ...state, ...newState })),
            setPin: (userId, pin) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: { ...state.users[userId], pin },
                    },
                })),
            setDarkMode: (userId, isDark) =>
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: { ...state.users[userId], darkMode: isDark },
                    },
                })),

            replaceState: (newState) => set((state) => ({ ...state, ...newState })),
        }),
        {
            name: 'haushalts-buddy-storage',
        }
    )
);
