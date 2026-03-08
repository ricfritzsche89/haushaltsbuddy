import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { ShieldAlert, Trash2, Plus, Gift, Smartphone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
    const { users, penalties, addPenalty } = useStore();

    const [penaltyTarget, setPenaltyTarget] = useState('Tyler');
    const [penaltyReason, setPenaltyReason] = useState('Zimmer nicht aufgeräumt');
    const [penaltyDuration, setPenaltyDuration] = useState(60); // minutes

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
        publishEvent('NOTIFICATION_SEND', {
            title: 'Handysperre!',
            body: `${penaltyDuration} Min für ${users[penaltyTarget as any]?.name} - Grund: ${penaltyReason}`
        });

        toast.success('Strafe erfolgreich verhängt');
        setPenaltyReason('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-4 overflow-y-auto">
            <div className="bg-slate-900 px-6 pt-10 pb-6 shadow-md text-white">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={28} className="text-red-400" />
                    <h1 className="text-3xl font-extrabold tracking-tight">Admin Zentrale</h1>
                </div>
                <p className="text-slate-400 font-medium mt-1 pl-10">Familien-Management</p>
            </div>

            <div className="px-6 py-6 space-y-8">

                {/* Penalty Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Smartphone size={20} className="text-red-500" /> Handysperre verhängen
                    </h2>

                    <form onSubmit={handleIssuePenalty} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kind</label>
                            <select
                                value={penaltyTarget}
                                onChange={e => setPenaltyTarget(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                            >
                                <option value="Tyler">Tyler</option>
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dauer (Min)</label>
                                <input
                                    type="number"
                                    value={penaltyDuration}
                                    onChange={e => setPenaltyDuration(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={!penaltyReason} className="w-full bg-red-500 text-white font-bold py-3 mt-2 rounded-xl active:bg-red-600 transition disabled:opacity-50">
                            Strafe senden
                        </button>
                    </form>
                </div>

                {/* Belohnungen Card (Stub) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Gift size={20} className="text-yellow-500" /> Belohnungen System
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">Erstelle Belohnungen für bestimmte Level (z.B. 5€ Karte bei Lvl 20).</p>
                    <button className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2">
                        <Plus size={18} /> Neue Belohnung einstellen
                    </button>
                </div>

                {/* Aufgaben verwalten (Stub) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Save size={20} className="text-blue-500" /> Aufgaben Datenbank
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">Standard-Aufnahmen, Schwierigkeit bearbeiten, Regeln verwalten.</p>
                    <button className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2">
                        Details bearbeiten
                    </button>
                </div>

            </div>
        </div>
    );
}
