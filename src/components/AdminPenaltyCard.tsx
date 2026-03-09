import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UserId } from '../types';

export default function AdminPenaltyCard() {
    const { users, addPenalty } = useStore();
    const [penaltyTarget, setPenaltyTarget] = useState('Tayler');
    const [penaltyReason, setPenaltyReason] = useState('Zimmer nicht aufgeräumt');
    const [penaltyDuration, setPenaltyDuration] = useState(60);

    const handleIssuePenalty = (e: React.FormEvent) => {
        e.preventDefault();
        if (!penaltyTarget) return;

        const newPenalty = {
            id: Math.random().toString(36).substr(2, 9),
            userId: penaltyTarget as any,
            reason: penaltyReason,
            durationMinutes: penaltyDuration,
            timestamp: Date.now()
        };

        addPenalty(newPenalty);
        publishEvent('PENALTY_ADDED', newPenalty);
        publishEvent('NOTIFICATION_SEND' as any, {
            title: 'Handysperre!',
            body: `${penaltyDuration} Min für ${users[penaltyTarget as UserId]?.name} - Grund: ${penaltyReason}`
        });

        sendPushNotification({
            title: `🚫 Handysperre: ${users[penaltyTarget as UserId]?.name}`,
            message: `${penaltyDuration} Min - Grund: ${penaltyReason}`,
            priority: 4,
            tags: ['rotating_light', 'warning'],
            targetUsers: [penaltyTarget as UserId]
        });

        toast.success('Strafe erfolgreich verhängt');
        setPenaltyReason('');
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-red-50 dark:border-slate-800 relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Smartphone size={20} className="text-red-500" /> Handysperre verhängen
            </h2>

            <form onSubmit={handleIssuePenalty} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kind</label>
                    <select
                        value={penaltyTarget}
                        onChange={e => setPenaltyTarget(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-colors"
                    >
                        <option value="Tayler">Tayler</option>
                        <option value="Fee">Fee</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grund</label>
                    <input
                        type="text"
                        value={penaltyReason}
                        onChange={e => setPenaltyReason(e.target.value)}
                        placeholder="z.B. Aufgaben ignoriert"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-colors"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dauer (Min)</label>
                        <input
                            type="number"
                            value={penaltyDuration}
                            onChange={e => setPenaltyDuration(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                <button type="submit" disabled={!penaltyReason} className="w-full bg-red-500 text-white font-bold py-3 mt-2 rounded-xl active:bg-red-600 transition disabled:opacity-50">
                    Strafe senden
                </button>
            </form>
        </div>
    );
}
