import React, { useState } from 'react';
import type { DayOfWeek, Task } from '../types';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const ROOMS = ['Küche', 'Wohnzimmer', 'Schlafzimmer', 'Bad', 'Flur', 'Kinderzimmer', 'Terrasse', 'Außer Haus', 'Verschiedenes', 'Ganzes Haus'];

const DEFAULT_TASK = {
    titel: '',
    raum: 'Küche' as string,
    beschreibung: '',
    schwierigkeitspunkte: 2,
    xpBelohnung: 20,
    wochentag: 'Montag' as DayOfWeek,
    zugewiesenerNutzer: '' as string,
};

interface CreateLiveTaskModalProps {
    onClose: () => void;
}

export default function CreateLiveTaskModal({ onClose }: CreateLiveTaskModalProps) {
    const { users, currentUser, addTask, taskTemplates } = useStore();
    const allUsers = Object.values(users);
    const [liveTask, setLiveTask] = useState({ ...DEFAULT_TASK });

    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        if (!templateId) return;

        const template = taskTemplates.find(t => t.id === templateId);
        if (template) {
            setLiveTask(prev => ({
                ...prev,
                titel: template.titel,
                raum: template.raum,
                beschreibung: template.beschreibung || '',
                schwierigkeitspunkte: template.schwierigkeitspunkte,
                xpBelohnung: template.xpBelohnung,
                zugewiesenerNutzer: template.festeZuweisung || prev.zugewiesenerNutzer,
            }));
        }
    };

    const handleCreateLiveTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!liveTask.titel.trim() || !liveTask.zugewiesenerNutzer) {
            toast.error('Bitte Titel und User auswählen!');
            return;
        }

        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            titel: liveTask.titel.trim(),
            raum: liveTask.raum,
            beschreibung: liveTask.beschreibung.trim(),
            schwierigkeitspunkte: liveTask.schwierigkeitspunkte,
            xpBelohnung: liveTask.xpBelohnung,
            zugewiesenerNutzer: liveTask.zugewiesenerNutzer as any,
            wochentag: liveTask.wochentag,
            status: 'offen',
            kommentare: [],
            erstelltAm: Date.now(),
        };

        addTask(newTask);
        publishEvent('TASK_ADDED', newTask);

        const assignedUser = users[liveTask.zugewiesenerNutzer as import('../types').UserId];
        if (assignedUser && currentUser) {
            sendPushNotification({
                title: `📋 Neue Aufgabe für dich!`,
                message: `${users[currentUser]?.name} hat dir "${newTask.titel}" am ${newTask.wochentag} zugewiesen.`,
                priority: 4,
                tags: ['clipboard'],
                click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/dashboard'
            });
        }

        toast.success(`Aufgabe "${newTask.titel}" erstellt ✅`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">➕ Neue Live-Aufgabe</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:scale-110 active:scale-95 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleCreateLiveTask} className="space-y-3">
                    {/* Vorlage auswählen */}
                    {taskTemplates.length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                                Aus Vorlage einfügen
                            </label>
                            <select
                                onChange={handleTemplateSelect}
                                className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-shadow appearance-none cursor-pointer"
                            >
                                <option value="">--- Vorlage wählen ---</option>
                                {taskTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.titel} ({t.raum})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* User auswählen */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Für wen?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {allUsers.map(u => (
                                <button key={u.id} type="button"
                                    onClick={() => setLiveTask(p => ({ ...p, zugewiesenerNutzer: u.id }))}
                                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 font-bold text-sm transition-all ${liveTask.zugewiesenerNutzer === u.id ? 'border-current text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                    style={liveTask.zugewiesenerNutzer === u.id ? { borderColor: u.color, backgroundColor: u.color } : {}}
                                >
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: u.color }}>{u.name.charAt(0)}</span>
                                    {u.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Titel */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Titel</label>
                        <input type="text" value={liveTask.titel} onChange={e => setLiveTask(p => ({ ...p, titel: e.target.value }))}
                            placeholder="z.B. Küche aufräumen" required
                            className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-shadow" />
                    </div>

                    {/* Beschreibung */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Beschreibung (optional)</label>
                        <textarea value={liveTask.beschreibung} onChange={e => setLiveTask(p => ({ ...p, beschreibung: e.target.value }))}
                            rows={2} placeholder="Was genau soll gemacht werden…"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-shadow" />
                    </div>

                    {/* Raum & Tag: 2 Spalten */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Raum</label>
                            <select value={liveTask.raum} onChange={e => setLiveTask(p => ({ ...p, raum: e.target.value }))}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-shadow">
                                {ROOMS.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Tag</label>
                            <select value={liveTask.wochentag} onChange={e => setLiveTask(p => ({ ...p, wochentag: e.target.value as DayOfWeek }))}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-shadow">
                                {DAYS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Wertigkeit & XP: 2 Spalten */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Wertigkeit (1–5)</label>
                            <input type="number" min={1} max={5} value={liveTask.schwierigkeitspunkte}
                                onChange={e => setLiveTask(p => ({ ...p, schwierigkeitspunkte: Number(e.target.value), xpBelohnung: Number(e.target.value) * 10 }))}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">XP Belohnung</label>
                            <input type="number" min={5} max={100} value={liveTask.xpBelohnung}
                                onChange={e => setLiveTask(p => ({ ...p, xpBelohnung: Number(e.target.value) }))}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-shadow" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-[0.98] mt-2 shadow-sm">
                        ✅ Aufgabe erstellen
                    </button>
                </form>
            </div>
        </div>
    );
}
