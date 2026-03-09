import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, TrendingUp, CheckCircle, SmartphoneNfc, Flame, Home, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { ALLE_TITEL } from '../types';
import UserAvatar from '../components/UserAvatar';

const getLevel = (xp: number) => Math.min(100, Math.floor(Math.sqrt(xp / 50)) + 1);
const getXpForNextLevel = (level: number) => 50 * level * level;

export default function Stats() {
    const { users, tasks, penalties } = useStore();
    const allUsers = Object.values(users);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const now = Date.now();
    const leaderboard = [...allUsers].sort((a, b) => b.xp - a.xp);
    const doneTasks = tasks.filter(t => t.status === 'erledigt' || t.status === 'verifiziert');
    const totalCompleted = doneTasks.length;
    const totalXP = allUsers.reduce((s, u) => s + u.xp, 0);
    const activeBans = penalties.filter(p => now < p.timestamp + p.durationMinutes * 60000);

    // Per-room breakdown
    const roomMap: Record<string, number> = {};
    doneTasks.forEach(t => { roomMap[t.raum] = (roomMap[t.raum] || 0) + 1; });
    const topRooms = Object.entries(roomMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Per-user stats
    const userStats = allUsers.map(u => {
        const mine = tasks.filter(t => t.zugewiesenerNutzer === u.id);
        const done = mine.filter(t => t.status === 'erledigt' || t.status === 'verifiziert');
        const pending = mine.filter(t => t.status === 'offen');
        const rate = mine.length > 0 ? Math.round((done.length / mine.length) * 100) : 0;
        const banCount = penalties.filter(p => p.userId === u.id).length;
        const activeBan = penalties.find(p => p.userId === u.id && now < p.timestamp + p.durationMinutes * 60000);
        const xpBySelf = done.reduce((s, t) => s + t.xpBelohnung, 0);
        // Simple streak: count consecutive days from today backwards where user had ≥1 done task
        const daysWithDone = new Set(done.map(t => {
            const d = new Date(t.erstelltAm);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));
        let streak = 0;
        const checkDay = new Date();
        for (let i = 0; i < 30; i++) {
            const key = `${checkDay.getFullYear()}-${checkDay.getMonth()}-${checkDay.getDate()}`;
            if (daysWithDone.has(key)) { streak++; checkDay.setDate(checkDay.getDate() - 1); }
            else break;
        }
        return { user: u, total: mine.length, done: done.length, pending: pending.length, rate, banCount, activeBan, streak };
    }).sort((a, b) => b.done - a.done);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-4 transition-colors">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 pt-10 pb-16 shadow-md text-white rounded-b-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h1 className="text-3xl font-extrabold tracking-tight relative z-10">Statistiken</h1>
                <p className="text-indigo-100 font-medium mt-1 relative z-10">Eure Leistungen im Überblick</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 -mt-10 space-y-5 relative z-10">

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard icon={<CheckCircle size={20} />} iconBg="bg-green-100 text-green-500" label="Aufgaben erledigt" value={totalCompleted} />
                    <StatCard icon={<TrendingUp size={20} />} iconBg="bg-orange-100 text-orange-500" label="Total XP" value={totalXP} />
                    <StatCard icon={<SmartphoneNfc size={20} />} iconBg="bg-red-100 text-red-500" label="Verbote" value={`${activeBans.length} aktiv / ${penalties.length} ges.`} small />
                    <StatCard icon={<Star size={20} />} iconBg="bg-yellow-100 text-yellow-500" label="Offen diese Woche" value={tasks.filter(t => t.status === 'offen').length} />
                </div>

                {/* Leaderboard */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                        <Trophy size={18} className="text-yellow-500" /> Leaderboard
                    </h2>
                    <div className="space-y-4">
                        {leaderboard.map((user, index) => {
                            const lvl = getLevel(user.xp);
                            const nextXP = getXpForNextLevel(lvl);
                            const prevXP = lvl > 1 ? getXpForNextLevel(lvl - 1) : 0;
                            const pct = Math.min(100, Math.max(0, ((user.xp - prevXP) / (nextXP - prevXP)) * 100));
                            const titel = ALLE_TITEL.find(t => t.id === user.activeTitle);
                            const hasBan = activeBans.some(p => p.userId === user.id);
                            return (
                                <div key={user.id} className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-400'}`}>
                                        #{index + 1}
                                    </div>
                                    <UserAvatar user={user} size={36} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-0.5 flex-wrap">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{user.name}</span>
                                                {titel && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${user.color}20`, color: user.color }}>{titel.emoji} {titel.name}</span>}
                                                {hasBan && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">📵 Verbot</span>}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">Lvl {lvl}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: user.color }} />
                                        </div>
                                        <div className="flex justify-between mt-0.5 px-0.5">
                                            <span className="text-[9px] text-slate-400">{user.xp} XP</span>
                                            <span className="text-[9px] text-slate-400">{nextXP} XP</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Per-User detail cards */}
                <div className="space-y-3">
                    <h2 className="text-base font-bold text-slate-700 dark:text-white px-1">👤 User-Details</h2>
                    {userStats.map(({ user, total, done, pending, rate, banCount, activeBan, streak }) => {
                        const isExpanded = expandedUser === user.id;
                        return (
                            <div key={user.id} className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 overflow-hidden transition-colors ${activeBan ? 'border-red-200 dark:border-red-800' : 'border-slate-100 dark:border-slate-800'}`}>
                                <button className="w-full flex items-center gap-3 p-4" onClick={() => setExpandedUser(isExpanded ? null : user.id)}>
                                    <UserAvatar user={user} size={40} />
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                                            {user.name}
                                            {streak > 1 && <span className="text-orange-500 text-xs font-bold flex items-center gap-0.5"><Flame size={10} /> {streak}d</span>}
                                            {activeBan && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">📵</span>}
                                        </p>
                                        <p className="text-xs text-slate-400">{done} / {total} Aufgaben · {rate}% erledigt</p>
                                    </div>
                                    {/* Mini progress */}
                                    <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                                        <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: user.color }} />
                                    </div>
                                    {isExpanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-3 border-t border-slate-50 dark:border-slate-800 pt-3">
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-3">
                                                <p className="text-lg font-extrabold text-green-600">{done}</p>
                                                <p className="text-[9px] font-bold uppercase text-green-500">Erledigt</p>
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3">
                                                <p className="text-lg font-extrabold text-orange-500">{pending}</p>
                                                <p className="text-[9px] font-bold uppercase text-orange-400">Offen</p>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3">
                                                <p className="text-lg font-extrabold text-red-500">{banCount}</p>
                                                <p className="text-[9px] font-bold uppercase text-red-400">Verbote</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm px-1">
                                            <span className="text-slate-500 dark:text-slate-400">XP gesamt</span>
                                            <span className="font-bold text-slate-800 dark:text-white">{user.xp} XP · Lvl {getLevel(user.xp)}</span>
                                        </div>
                                        {streak > 0 && (
                                            <div className="flex items-center justify-between text-sm px-1">
                                                <span className="text-slate-500 dark:text-slate-400">Aktuelle Streak</span>
                                                <span className="font-bold text-orange-500 flex items-center gap-1"><Flame size={14} /> {streak} Tag{streak !== 1 ? 'e' : ''}</span>
                                            </div>
                                        )}
                                        {activeBan && (
                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3 text-sm">
                                                <p className="font-bold text-red-500 flex items-center gap-1 mb-0.5"><SmartphoneNfc size={14} /> Aktives Verbot</p>
                                                <p className="text-red-400 text-xs">{activeBan.reason}</p>
                                                <p className="text-red-300 text-xs mt-0.5">Bis: {new Date(activeBan.timestamp + activeBan.durationMinutes * 60000).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Top Rooms */}
                {topRooms.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                            <Home size={18} className="text-blue-400" /> Erledigte Aufgaben nach Raum
                        </h2>
                        <div className="space-y-3">
                            {topRooms.map(([room, count]) => {
                                const pct = Math.round((count / totalCompleted) * 100);
                                return (
                                    <div key={room}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold text-slate-600 dark:text-slate-300">{room}</span>
                                            <span className="font-bold text-slate-400">{count}× ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// Helper stat card
function StatCard({ icon, iconBg, label, value, small }: { icon: React.ReactNode; iconBg: string; label: string; value: number | string; small?: boolean }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-50 dark:border-slate-800 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div>
            <p className={`font-extrabold text-slate-800 dark:text-white text-center transition-colors ${small ? 'text-sm leading-tight' : 'text-2xl'}`}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">{label}</p>
        </div>
    );
}
