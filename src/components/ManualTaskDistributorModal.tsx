import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import type { DayOfWeek, UserId, Task, TaskTemplate } from '../types';
import { X, Trash2, Plus, ChevronRight, ChevronLeft, Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const DAY_SHORT: Record<DayOfWeek, string> = {
    Montag: 'Mo', Dienstag: 'Di', Mittwoch: 'Mi', Donnerstag: 'Do',
    Freitag: 'Fr', Samstag: 'Sa', Sonntag: 'So'
};

const generateId = () => Math.random().toString(36).substr(2, 9);

interface Props {
    onClose: () => void;
}

export default function ManualTaskDistributorModal({ onClose }: Props) {
    const { users, tasks, taskTemplates, addTask, removeTask, clearTasks } = useStore();

    const allUsers = Object.values(users);
    const [selectedUser, setSelectedUser] = useState<UserId>(allUsers[0]?.id as UserId);
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Montag');
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Tasks for current user + day
    const currentTasks = useMemo(
        () => tasks.filter(t => t.zugewiesenerNutzer === selectedUser && t.wochentag === selectedDay),
        [tasks, selectedUser, selectedDay]
    );

    const filteredTemplates = useMemo(() =>
        taskTemplates.filter(t => t.titel.toLowerCase().includes(search.toLowerCase())),
        [taskTemplates, search]
    );

    const handleAddTask = (template: TaskTemplate) => {
        const newTask: Task = {
            id: generateId(),
            titel: template.titel,
            raum: template.raum,
            beschreibung: template.beschreibung,
            xpBelohnung: template.xpBelohnung,
            schwierigkeitspunkte: template.schwierigkeitspunkte,
            zugewiesenerNutzer: selectedUser,
            wochentag: selectedDay,
            status: 'offen',
            kommentare: [],
            erstelltAm: Date.now(),
        };
        addTask(newTask);
        publishEvent('TASK_ADDED', newTask);
        setSearch('');
        setShowDropdown(false);
    };

    const handleRemoveTask = (taskId: string) => {
        removeTask(taskId);
        publishEvent('TASK_REMOVED', { id: taskId });
    };

    const handleClearWeek = () => {
        if (window.confirm('Die gesamte Woche löschen? Alle Aufgaben werden entfernt.')) {
            clearTasks();
            publishEvent('TASKS_CLEARED', {});
            toast.success('Wochenplan gelöscht!');
        }
    };

    const handleNextDay = () => {
        const idx = DAYS.indexOf(selectedDay);
        if (idx < DAYS.length - 1) {
            setSelectedDay(DAYS[idx + 1]);
        } else {
            // Move to next user
            const userList = allUsers.map(u => u.id as UserId);
            const uIdx = userList.indexOf(selectedUser);
            if (uIdx < userList.length - 1) {
                setSelectedUser(userList[uIdx + 1]);
                setSelectedDay('Montag');
                toast('Weiter zum nächsten User! 👤', { icon: '✅' });
            } else {
                toast.success('Alle User komplett verteilt! 🎉');
            }
        }
    };

    const handlePrevDay = () => {
        const idx = DAYS.indexOf(selectedDay);
        if (idx > 0) setSelectedDay(DAYS[idx - 1]);
    };

    // How many days have at least one task for this user
    const daysWithTasks = DAYS.filter(d => tasks.some(t => t.zugewiesenerNutzer === selectedUser && t.wochentag === d));
    const isWeekComplete = daysWithTasks.length === 7;

    const user = users[selectedUser];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[95vh] flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-black">Aufgaben verteilen</h2>
                            <p className="text-white/70 text-sm font-medium">Manuell zuweisen</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                        {allUsers.map(u => (
                            <button
                                key={u.id}
                                onClick={() => setSelectedUser(u.id as UserId)}
                                className={`flex flex-col items-center gap-1 flex-shrink-0 transition-all ${selectedUser === u.id ? 'scale-110' : 'opacity-60'}`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white shadow-md border-2 transition-all ${selectedUser === u.id ? 'border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: u.color }}
                                >
                                    {u.name[0]}
                                </div>
                                <span className="text-[10px] font-bold text-white">{u.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Day Progress Bar */}
                <div className="flex-shrink-0 px-4 pt-3 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 mb-2">
                        {DAYS.map(d => {
                            const hasTasks = tasks.some(t => t.zugewiesenerNutzer === selectedUser && t.wochentag === d);
                            const isActive = d === selectedDay;
                            return (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDay(d)}
                                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all relative ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {DAY_SHORT[d]}
                                    {hasTasks && (
                                        <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{user?.name}</span> — {daysWithTasks.length}/7 Tage
                        {isWeekComplete && <span className="ml-2 text-emerald-500 font-bold">✓ Vollständig</span>}
                    </p>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Current Day Tasks */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                            {selectedDay} – {user?.name} ({currentTasks.length} Aufgaben)
                        </h3>

                        {currentTasks.length === 0 ? (
                            <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400 text-sm font-medium">Noch keine Aufgaben</p>
                                <p className="text-slate-300 dark:text-slate-600 text-xs">Wähle eine aus dem Dropdown</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {currentTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{task.schwierigkeitspunkte}P</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white text-sm">{task.titel}</p>
                                                <p className="text-xs text-slate-400">{task.raum}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveTask(task.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Task Search / Dropdown */}
                    <div className="relative">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">Aufgabe hinzufügen</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Aufgabe suchen..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {showDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-10 max-h-48 overflow-y-auto">
                                {filteredTemplates.length === 0 ? (
                                    <p className="text-center text-sm text-slate-400 py-4">Keine Treffer</p>
                                ) : (
                                    filteredTemplates.map(t => (
                                        <button
                                            key={t.id}
                                            onMouseDown={() => handleAddTask(t)}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-left border-b border-slate-50 dark:border-slate-700 last:border-0"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{t.titel}</p>
                                                <p className="text-xs text-slate-400">{t.raum} · {t.schwierigkeitspunkte} Punkte · {t.xpBelohnung} XP</p>
                                            </div>
                                            <Plus size={16} className="text-indigo-500 flex-shrink-0" />
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    {/* Nav: prev/next day */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrevDay}
                            disabled={selectedDay === 'Montag'}
                            className="flex-none p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={handleNextDay}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            {selectedDay === 'Sonntag' ? (
                                <>
                                    <Check size={18} /> Nächster User
                                </>
                            ) : (
                                <>
                                    Nächster Tag
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Clear Week Button */}
                    <button
                        onClick={handleClearWeek}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold text-sm transition-all hover:bg-rose-100 dark:hover:bg-rose-900/40"
                    >
                        <Trash2 size={16} /> Ganze Woche löschen
                    </button>
                </div>
            </div>

            {/* Close dropdown when clicking outside */}
            {showDropdown && (
                <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />
            )}
        </div>
    );
}
