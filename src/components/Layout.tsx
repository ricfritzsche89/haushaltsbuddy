import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import A2HSPrompt from './A2HSPrompt';
import { Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import NotificationCenterModal from './NotificationCenterModal';

export default function Layout() {
    const [showNotifs, setShowNotifs] = useState(false);
    const { currentUser, notifications } = useStore();

    const myNotifs = notifications.filter(n => n.userId === currentUser && !n.read);
    const unreadCount = myNotifs.length;

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
            {/* Top Right Floating Action Button (Optional Notification Trigger) */}
            {currentUser && (
                <button
                    onClick={() => setShowNotifs(true)}
                    className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
                >
                    <div className="relative">
                        <Bell size={22} className="text-slate-600 dark:text-slate-300" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold justify-center items-center flex border-2 border-white dark:border-slate-800 shadow-sm animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                </button>
            )}

            <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto bg-white dark:bg-slate-900 shadow-xl relative pb-20 pt-16 transition-colors">
                <Outlet />
            </main>
            <A2HSPrompt />
            <div className="fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 z-50">
                <Navigation />
            </div>

            {showNotifs && <NotificationCenterModal onClose={() => setShowNotifs(false)} />}
        </div>
    );
}
