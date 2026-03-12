import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { X, TrendingUp, Flame, Trophy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { DayOfWeek } from '../types';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

interface Props { onClose: () => void; }

export default function WeeklyReportModal({ onClose }: Props) {
    const { users, tasks } = useStore();

    const userStats = useMemo(() => {
        return Object.values(users).map(user => {
            const userTasks = tasks.filter(t => t.zugewiesenerNutzer === user.id);
            const total = userTasks.length;
            const done = userTasks.filter(t => t.status === 'verifiziert' || t.status === 'erledigt').length;
            const verified = userTasks.filter(t => t.status === 'verifiziert').length;
            const open = userTasks.filter(t => t.status === 'offen').length;
            const xpEarned = userTasks
                .filter(t => t.status === 'verifiziert' || t.status === 'erledigt')
                .reduce((s, t) => s + (t.xpBelohnung || 0), 0);
            const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

            const dayBreakdown = DAYS.map(day => {
                const dayTasks = userTasks.filter(t => t.wochentag === day);
                const dayDone = dayTasks.filter(t => t.status !== 'offen').length;
                return { day, total: dayTasks.length, done: dayDone };
            });

            return { user, total, done, verified, open, xpEarned, completionRate, dayBreakdown };
        });
    }, [users, tasks]);

    const weekTotal = tasks.length;
    const weekDone = tasks.filter(t => t.status !== 'offen').length;
    const weekRate = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
    const topUser = [...userStats].sort((a, b) => b.done - a.done)[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <TrendingUp size={22} /> Wochenbericht
                            </h2>
                            <p className="text-white/70 text-sm font-medium mt-0.5">Zusammenfassung dieser Woche</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Overall week pill */}
                    <div className="mt-4 flex items-center gap-4 bg-white/10 rounded-2xl p-3">
                        <div className="text-center flex-1">
                            <p className="text-3xl font-black">{weekRate}%</p>
                            <p className="text-white/70 text-xs font-bold">Gesamtquote</p>
                        </div>
                        <div className="text-center flex-1 border-l border-white/20">
                            <p className="text-3xl font-black">{weekDone}<span className="text-white/50 text-lg">/{weekTotal}</span></p>
                            <p className="text-white/70 text-xs font-bold">Erledigt</p>
                        </div>
                        {topUser && (
                            <div className="text-center flex-1 border-l border-white/20">
                                <p className="text-xl font-black">{topUser.user.name}</p>
                                <p className="text-white/70 text-xs font-bold flex items-center justify-center gap-1"><Trophy size={10} /> Bester</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {userStats.map(({ user, total, done, verified, open, xpEarned, completionRate, dayBreakdown }) => (
                        <div key={user.id} className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0"
                                    style={{ backgroundColor: user.color }}
                                >
                                    {user.avatarUrl
                                        ? <img src={user.avatarUrl} className="w-full h-full object-cover rounded-full" />
                                        : user.name[0]
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-800 dark:text-white">{user.name}</p>
                                        {(user.streak || 0) > 1 && (
                                            <span className="flex items-center gap-0.5 text-orange-500 text-xs font-black bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                                                <Flame size={12} /> {user.streak}d
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                        <span className="flex items-center gap-1 text-emerald-500 font-bold"><CheckCircle2 size={12} /> {verified} verifiziert</span>
                                        <span className="flex items-center gap-1 text-amber-500 font-bold"><Clock size={12} /> {done - verified} ausstehend</span>
                                        <span className="flex items-center gap-1 text-slate-400 font-bold"><XCircle size={12} /> {open} offen</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-2xl font-black" style={{ color: user.color }}>{completionRate}%</p>
                                    <p className="text-xs text-slate-400 font-medium">+{xpEarned} XP</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${completionRate}%`, backgroundColor: user.color }}
                                />
                            </div>

                            {/* Day breakdown mini grid */}
                            <div className="flex gap-1">
                                {dayBreakdown.map(({ day, total: dt, done: dd }) => (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                                        <div
                                            className={`w-full h-1.5 rounded-full ${
                                                dt === 0 ? 'bg-slate-200 dark:bg-slate-700'
                                                : dd === dt ? 'bg-emerald-400'
                                                : dd > 0 ? 'bg-amber-400'
                                                : 'bg-rose-300 dark:bg-rose-800'
                                            }`}
                                        />
                                        <span className="text-[9px] font-bold text-slate-400">{day.substring(0, 2)}</span>
                                    </div>
                                ))}
                            </div>
                            {total === 0 && (
                                <p className="text-xs text-slate-400 text-center py-2">Keine Aufgaben diese Woche</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
}
