import { useState, useEffect } from 'react';
import type { Penalty } from '../types';
import { Clock, Play, Trash2 } from 'lucide-react';
import UserAvatar from './UserAvatar';

// ---- Live-Countdown-Hook ----
export function useCountdown(endMs: number) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (endMs <= now) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [endMs, now]);
    return Math.max(0, endMs - now);
}

export function FormatCountdown({ endMs }: { endMs: number }) {
    const remainingMs = useCountdown(endMs);
    if (remainingMs <= 0) return <span className="text-slate-500 font-bold">Abgelaufen!</span>;

    const totalSecs = Math.floor(remainingMs / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    let text = d > 0 ? `${d}T ` : '';
    text += `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return <span className="font-mono">{text}</span>;
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} Min`;
    if (minutes < 1440) return `${minutes / 60} Std`;
    if (minutes < 10080) return `${minutes / 1440} Tage`;
    return `${minutes / 10080} Wochen`;
}

interface PenaltyCardProps {
    penalty: Penalty;
    isActive: boolean;
    isAdmin: boolean;
    users: Record<string, any>;
    onActivate: (p: Penalty) => void;
    onDelete: (id: string, name: string) => void;
}

export default function PenaltyCard({ penalty, isActive, isAdmin, users, onActivate, onDelete }: PenaltyCardProps) {
    const victim = users[penalty.userId];
    const issuer = penalty.issuedBy ? users[penalty.issuedBy] : null;
    const endsAt = penalty.activatedAt ? penalty.activatedAt + (penalty.durationMinutes * 60 * 1000) : null;

    return (
        <div
            className={`
                relative overflow-hidden rounded-3xl p-5 border-2 transition-all shadow-sm
                ${isActive
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-75'
                }
            `}
        >
            <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <UserAvatar user={victim} size={64} />
                    <div>
                        <h3 className={`font-extrabold text-lg leading-tight ${isActive ? 'text-rose-900 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {penalty.reason}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 hidden sm:flex">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                von {issuer?.name || 'Unbekannt'}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Clock size={12} /> {formatDuration(penalty.durationMinutes)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 isolate">
                    {!isActive && isAdmin && (
                        <button
                            onClick={() => onActivate(penalty)}
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 p-2 rounded-xl transition-colors shrink-0 shadow-sm"
                            title="Jetzt aktivieren"
                        >
                            <Play size={18} />
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={() => onDelete(penalty.id, penalty.reason)}
                            className="bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-900/60 p-2 rounded-xl transition-colors shrink-0 shadow-sm"
                            title="Löschen"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {penalty.photoUrl && (
                <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative group bg-black/5">
                    <img src={penalty.photoUrl} alt="Beweis" className="w-full h-auto max-h-[400px] object-contain" />
                </div>
            )}

            {/* Mobile metadata row */}
            <div className="flex sm:hidden items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    von {issuer?.name || 'Unbekannt'}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md flex items-center gap-1">
                    <Clock size={12} /> {formatDuration(penalty.durationMinutes)}
                </span>
            </div>

            <div className={`
                flex items-center gap-2 p-3 rounded-2xl font-bold text-sm justify-center shadow-inner
                ${isActive
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }
            `}>
                <Clock size={16} />
                {isActive && endsAt ? (
                    <FormatCountdown endMs={endsAt} />
                ) : (
                    "Inaktiv (Wartet auf Start)"
                )}
            </div>
        </div>
    );
}
