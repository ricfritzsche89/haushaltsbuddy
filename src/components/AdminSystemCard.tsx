import { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UserId } from '../types';

export default function AdminSystemCard() {
    const { users } = useStore();
    const [resetTarget, setResetTarget] = useState('Tayler');

    const handleForceSync = () => {
        if (window.confirm('Möchtest du deinen aktuellen App-Stand (Aufgaben, Punkte etc.) auf alle anderen Geräte übertragen?')) {
            const state = useStore.getState();
            publishEvent('FULL_STATE_SYNC', state);
            toast.success('Synchronisation an alle Geräte gesendet!');
        }
    };

    const handleResetXP = () => {
        if (!resetTarget) return;
        const targetUser = users[resetTarget as UserId];
        if (!targetUser) return;

        if (window.confirm(`Möchtest du die XP und das Level von ${targetUser.name} wirklich komplett auf 0 zurücksetzen? Alle bisher freigeschalteten Titel gehen dabei verloren.`)) {
            useStore.getState().resetUserXP(targetUser.id);
            // Broadcast the new fully reset user object
            publishEvent('USER_PROFILE_UPDATED', {
                userId: targetUser.id,
                updates: useStore.getState().users[targetUser.id]
            });
            toast.success(`XP von ${targetUser.name} wurden zurückgesetzt!`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Level & XP Reset Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-purple-50 dark:border-slate-800 relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-400"></div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} className="text-purple-500" /> XP & Level zurücksetzen
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nutzer auswählen</label>
                        <select
                            value={resetTarget}
                            onChange={e => setResetTarget(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-colors"
                        >
                            {Object.values(users).map(u => (
                                <option key={u.id} value={u.id}>{u.name} (Lvl {Math.min(100, Math.floor(Math.sqrt(u.xp / 50)) + 1)} - {u.xp} XP)</option>
                            ))}
                        </select>
                    </div>

                    <button onClick={handleResetXP} className="w-full bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 font-bold py-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 active:bg-purple-100 transition flex items-center justify-center gap-2">
                        <RefreshCw size={18} /> XP auf 0 setzen
                    </button>
                </div>
            </div>

            {/* Datenbank Sync Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-50 dark:border-slate-800 relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <Database size={20} className="text-emerald-500" /> Datenbank
                </h2>
                <p className="text-sm text-slate-500 mb-4">Fehlen Aufgaben auf anderen Handys? Übertrage deinen aktuellen Stand auf alle Geräte.</p>
                <button onClick={handleForceSync} className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                    <RefreshCw size={18} /> Jetzt synchronisieren
                </button>
            </div>
        </div>
    );
}
