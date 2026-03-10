import { useState } from 'react';
import type { DayOfWeek } from '../types';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { generateWeeklyPlan } from '../services/generatorService';
import DayColumn from '../components/DayColumn';
import CreateLiveTaskModal from '../components/CreateLiveTaskModal';
import NotificationCenterModal from '../components/NotificationCenterModal';
import { Sparkles, CalendarDays, ArrowLeftRight, X, Plus, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export default function Dashboard() {
    const { users, tasks, notifications, currentUser, setTasks, updateTask } = useStore();
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DAYS[(new Date().getDay() + 6) % 7]);
    const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
    const [showLiveTask, setShowLiveTask] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);

    const userObj = currentUser ? users[currentUser] : null;
    const isAdmin = Boolean(currentUser && users[currentUser]?.role === 'admin');
    const filterUser = userObj?.dashboardFilter || 'all';
    const viewMode = userObj?.dashboardView || 'week';
    const unreadCount = notifications.filter(n => n.userId === currentUser && !n.read).length;

    const setFilterUser = (val: string) => {
        if (currentUser) useStore.getState().updateUserProfile(currentUser, { dashboardFilter: val });
    };

    const handleGeneratePlan = () => {
        if (window.confirm('Bist du sicher? Der aktuelle Wochenplan wird überschrieben.')) {
            const newPlan = generateWeeklyPlan();
            setTasks(newPlan);
            publishEvent('WEEKLY_PLAN_GENERATED', newPlan);
        }
    };

    // --- Swap Logic ---
    const handleSwapSelect = (taskId: string) => {
        if (!taskId) { setSwapSourceId(null); return; }
        if (!swapSourceId) {
            setSwapSourceId(taskId);
            toast('Aufgabe ausgewählt! Tippe jetzt auf eine andere deiner Aufgaben zum Tauschen.', { icon: '🔄', duration: 4000 });
            return;
        }
        if (swapSourceId === taskId) { setSwapSourceId(null); return; }

        const sourceTask = tasks.find(t => t.id === swapSourceId);
        const targetTask = tasks.find(t => t.id === taskId);
        if (!sourceTask || !targetTask) { setSwapSourceId(null); return; }

        if (sourceTask.zugewiesenerNutzer !== currentUser || targetTask.zugewiesenerNutzer !== currentUser) {
            toast.error('Du kannst nur deine eigenen Aufgaben tauschen!');
            setSwapSourceId(null);
            return;
        }
        if (sourceTask.wochentag === targetTask.wochentag) {
            toast('Beide Aufgaben sind am gleichen Tag.', { icon: 'ℹ️' });
            setSwapSourceId(null);
            return;
        }

        updateTask(sourceTask.id, { wochentag: targetTask.wochentag });
        updateTask(targetTask.id, { wochentag: sourceTask.wochentag });
        publishEvent('TASK_UPDATED', { id: sourceTask.id, updates: { wochentag: targetTask.wochentag } });
        publishEvent('TASK_UPDATED', { id: targetTask.id, updates: { wochentag: sourceTask.wochentag } });
        toast.success(`"${sourceTask.titel}" & "${targetTask.titel}" getauscht! 🔄`);
        setSwapSourceId(null);
    };

    const displayedDays = viewMode === 'week' ? DAYS : [selectedDay];

    return (
        <div className="h-full flex flex-col relative pt-4 -mx-6 px-6 overflow-hidden">

            {/* Top-right action buttons - Shifted 15px left per User request */}
            <div className="absolute top-4 right-[31px] z-20 flex gap-2">
                {/* Bell / Notifications */}
                <button
                    onClick={() => setShowNotifs(true)}
                    className="relative flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-md transition-all active:scale-95 hover:scale-105"
                >
                    <Bell size={18} className="text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white dark:border-slate-800 animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Admin-only: Live-Aufgabe Button */}
                {isAdmin && (
                    <button
                        onClick={() => setShowLiveTask(true)}
                        className="flex items-center justify-center w-9 h-9 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-500 text-white rounded-full shadow-md transition-all active:scale-95"
                    >
                        <Plus size={18} />
                    </button>
                )}
                {/* Admin-only: Plan Generieren */}
                {isAdmin && (
                    <button
                        onClick={handleGeneratePlan}
                        className="flex items-center justify-center w-9 h-9 bg-indigo-600 active:bg-indigo-700 hover:bg-indigo-500 text-white rounded-full shadow-md transition-all active:scale-95"
                    >
                        <Sparkles size={18} />
                    </button>
                )}
            </div>

            {/* Modals */}
            {showLiveTask && <CreateLiveTaskModal onClose={() => setShowLiveTask(false)} />}
            {showNotifs && <NotificationCenterModal onClose={() => setShowNotifs(false)} />}

            {/* Swap Mode Banner */}
            {swapSourceId && (
                <div className="absolute top-0 left-0 right-0 z-30 bg-indigo-600 text-white px-6 py-2 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <ArrowLeftRight size={16} />
                        Tippe eine andere deiner Aufgaben zum Tauschen
                    </div>
                    <button onClick={() => setSwapSourceId(null)} className="p-1 hover:bg-indigo-700 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className={`flex flex-col mb-4 flex-shrink-0 ${swapSourceId ? 'mt-8' : ''}`}>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight ml-2">Wochenplan</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-2">Diese Woche zu erledigen</p>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 shrink-0 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-2xl">
                <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
                    className="flex-1 min-w-[140px] bg-white dark:bg-slate-900 border-none text-slate-700 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm outline-none transition-colors">
                    <option value="all">Alle Aufgaben</option>
                    {Object.values(users).map(u => <option key={u.id} value={u.id}>{u.name}'s Aufgaben</option>)}
                </select>

                <button onClick={() => { if (currentUser) useStore.getState().setDashboardView(currentUser, viewMode === 'week' ? 'today' : 'week'); }}
                    className="bg-white dark:bg-slate-900 border-none text-slate-700 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <CalendarDays size={16} />
                    {viewMode === 'week' ? 'Ganze Woche' : 'Tagesansicht'}
                </button>
            </div>

            {/* Day Selector (today mode) */}
            {viewMode === 'today' && (
                <div className="flex overflow-x-auto pb-3 gap-2 hide-scrollbar mb-2 px-1 shrink-0">
                    {DAYS.map(day => (
                        <button key={day} onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedDay === day
                                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md'
                                : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                            {day.substring(0, 2)}
                        </button>
                    ))}
                </div>
            )}

            <div className={`flex-1 overflow-x-auto overflow-y-hidden pb-6 px-2
                ${viewMode === 'week' ? 'flex snap-x snap-mandatory lg:snap-none lg:gap-4' : 'flex justify-center items-start pl-[10px]'}
            `}>
                {displayedDays.map((day) => {
                    let dayTasks = tasks.filter((t) => t.wochentag === day);
                    if (filterUser !== 'all') dayTasks = dayTasks.filter(t => t.zugewiesenerNutzer === filterUser);

                    return (
                        <div key={day} className={`snap-center shrink-0 h-full ${viewMode === 'today' ? 'w-[85vw] max-w-sm sm:w-[320px]' : ''}`}>
                            <DayColumn
                                day={day}
                                tasks={dayTasks}
                                isCompact={viewMode === 'week'}
                                onDayClick={() => {
                                    if (currentUser && viewMode === 'week') {
                                        setSelectedDay(day);
                                        useStore.getState().setDashboardView(currentUser, 'today');
                                    }
                                }}
                                swapSourceId={swapSourceId}
                                onSwapSelect={handleSwapSelect}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
