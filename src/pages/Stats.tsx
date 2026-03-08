import React from 'react';
import { useStore } from '../store/useStore';
import { Trophy, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function Stats() {
    const { users, tasks } = useStore();
    const allUsers = Object.values(users);

    // Calculate Level (1-100 progressive based on base 50XP)
    const getLevel = (xp: number) => {
        // Basic progression: level = floor((sqrt(100 * (2 * xp + 25)) + 50) / 100) or simpler
        // Let's use simpler: Level = floor(sqrt(xp / 50)) + 1
        // e.g. Level 1 = 0-49, Lvl 2 = 50-199
        return Math.min(100, Math.floor(Math.sqrt(xp / 50)) + 1);
    };

    const getXpForNextLevel = (level: number) => {
        return 50 * (level * level);
    };

    // Leaderboard sorting
    const leaderboard = [...allUsers].sort((a, b) => b.xp - a.xp);
    const totalCompleted = tasks.filter(t => t.status === 'erledigt' || t.status === 'verifiziert').length;

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 pt-10 pb-16 shadow-md text-white rounded-b-3xl relative overflow-hidden">

                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <h1 className="text-3xl font-extrabold tracking-tight relative z-10">Statistiken</h1>
                <p className="text-indigo-100 font-medium mt-1 relative z-10">Eure Leistungen im Überblick</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 -mt-10 space-y-6 relative z-10">

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)] border border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                            <CheckCircle size={20} />
                        </div>
                        <div className="text-center">
                            <p className="font-extrabold text-2xl text-slate-800">{totalCompleted}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aufgaben</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)] border border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                            <TrendingUp size={20} />
                        </div>
                        <div className="text-center">
                            <p className="font-extrabold text-2xl text-slate-800">{allUsers.reduce((sum, u) => sum + u.xp, 0)}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total XP</p>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <Trophy size={20} className="text-yellow-500" /> Leaderboard
                    </h2>

                    <div className="space-y-5">
                        {leaderboard.map((user, index) => {
                            const currentLvl = getLevel(user.xp);
                            const nextLvlXp = getXpForNextLevel(currentLvl);
                            const prevLvlXp = currentLvl > 1 ? getXpForNextLevel(currentLvl - 1) : 0;
                            const progressPercentage = Math.min(100, Math.max(0, ((user.xp - prevLvlXp) / (nextLvlXp - prevLvlXp)) * 100));

                            return (
                                <div key={user.id} className="relative">
                                    <div className="flex items-center gap-4">

                                        {/* Rank Badge */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-300' :
                                                index === 1 ? 'bg-slate-300 text-slate-700 border-2 border-slate-200' :
                                                    index === 2 ? 'bg-orange-300 text-orange-900 border-2 border-orange-200' :
                                                        'bg-slate-100 text-slate-400'}`}
                                        >
                                            #{index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="font-bold text-slate-700">
                                                    {user.name}
                                                    {index === 0 && <span className="ml-2 text-[10px] uppercase font-bold text-yellow-500 bg-yellow-100 px-2 py-0.5 rounded-full">Haushalts-King</span>}
                                                </span>
                                                <span className="text-sm font-bold text-slate-400 bg-slate-50 px-2 rounded-lg">Lvl {currentLvl}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${progressPercentage}%`, backgroundColor: user.color }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1 px-1">
                                                <span className="text-[10px] font-semibold text-slate-400">{user.xp} XP</span>
                                                <span className="text-[10px] font-semibold text-slate-400">{nextLvlXp} XP</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
