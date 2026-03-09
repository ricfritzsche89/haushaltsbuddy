import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { TaskTemplate, TaskFrequency, UserId } from '../types';
import { Save, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskDatabase() {
    const { taskTemplates, addTaskTemplate, updateTaskTemplate, removeTaskTemplate, users } = useStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form states
    const [titel, setTitel] = useState('');
    const [raum, setRaum] = useState('');
    const [beschreibung, setBeschreibung] = useState('');
    const [xp, setXp] = useState(10);
    const [diff, setDiff] = useState(1);
    const [frequenz, setFrequenz] = useState<TaskFrequency>('nach_bedarf');
    const [festeZuweisung, setFesteZuweisung] = useState<UserId | ''>('');
    const [erlaubteNutzer, setErlaubteNutzer] = useState<UserId[]>([]);

    const frequencies: { value: TaskFrequency, label: string }[] = [
        { value: 'täglich', label: 'Täglich' },
        { value: 'alle_3_tage', label: 'Alle 3 Tage' },
        { value: '2x_woche', label: '2x pro Woche' },
        { value: '1x_woche', label: '1x pro Woche' },
        { value: '1x_monat', label: '1x pro Monat' },
        { value: 'nach_bedarf', label: 'Nach Bedarf' },
    ];

    const resetForm = () => {
        setTitel(''); setRaum(''); setBeschreibung(''); setXp(10); setDiff(1); setFrequenz('nach_bedarf'); setFesteZuweisung(''); setErlaubteNutzer([]);
        setEditingId(null);
        setIsAdding(false);
    };

    const startEdit = (template: TaskTemplate) => {
        setTitel(template.titel);
        setRaum(template.raum);
        setBeschreibung(template.beschreibung || '');
        setXp(template.xpBelohnung);
        setDiff(template.schwierigkeitspunkte);
        setFrequenz(template.frequenz);
        setFesteZuweisung(template.festeZuweisung || '');
        setErlaubteNutzer(template.erlaubteNutzer || []);
        setEditingId(template.id);
        setIsAdding(false);
    };

    const startAdd = () => {
        resetForm();
        setIsAdding(true);
    };

    const handleSave = () => {
        if (!titel.trim() || !raum.trim()) {
            toast.error('Titel und Raum sind Pflichtfelder');
            return;
        }

        const templateData: Partial<TaskTemplate> = {
            titel,
            raum,
            beschreibung,
            xpBelohnung: xp,
            schwierigkeitspunkte: diff,
            frequenz,
            festeZuweisung: festeZuweisung ? (festeZuweisung as UserId) : null,
            erlaubteNutzer
        };

        if (editingId) {
            updateTaskTemplate(editingId, templateData);
            toast.success('Aufgabe aktualisiert!');
        } else if (isAdding) {
            addTaskTemplate({
                id: Math.random().toString(36).substr(2, 9),
                ...(templateData as any)
            });
            toast.success('Neue Aufgabe hinzugefügt!');
        }

        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Diese Vorlage wirklich löschen?")) {
            removeTaskTemplate(id);
            toast.success('Aufgabe gelöscht');
        }
    };

    // Group templates by Raum
    const groupedTemplates = taskTemplates.reduce((acc, t) => {
        if (!acc[t.raum]) acc[t.raum] = [];
        acc[t.raum].push(t);
        return acc;
    }, {} as Record<string, TaskTemplate[]>);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Save size={20} className="text-blue-500" /> Aufgaben Datenbank
                </h2>
                {!isAdding && !editingId && (
                    <button onClick={startAdd} className="bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-700 transition">
                        <Plus size={20} />
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">{isAdding ? 'Neue Aufgabe' : 'Aufgabe bearbeiten'}</h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titel</label>
                                <input type="text" value={titel} onChange={e => setTitel(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Raum</label>
                                <input type="text" value={raum} onChange={e => setRaum(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Beschreibung (Details zur Aufgabe)</label>
                            <textarea
                                value={beschreibung}
                                onChange={e => setBeschreibung(e.target.value)}
                                rows={2}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">XP</label>
                                <input type="number" value={xp} onChange={e => setXp(Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Wertigkeit</label>
                                <input type="number" min="1" max="5" value={diff} onChange={e => setDiff(Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequenz</label>
                                <select value={frequenz} onChange={e => setFrequenz(e.target.value as TaskFrequency)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors">
                                    {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Feste Zuweisung</label>
                                <select value={festeZuweisung} onChange={e => setFesteZuweisung(e.target.value as any)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors">
                                    <option value="">Keine (Alle)</option>
                                    {Object.values(users).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Erlaubte Nutzer (Optional, leer = alle dürfen)</label>
                            <div className="flex flex-wrap gap-3">
                                {Object.values(users).map(u => (
                                    <label key={u.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={erlaubteNutzer.includes(u.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setErlaubteNutzer([...erlaubteNutzer, u.id]);
                                                } else {
                                                    setErlaubteNutzer(erlaubteNutzer.filter(id => id !== u.id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">{u.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-2">
                            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2">
                                <Check size={18} /> Speichern
                            </button>
                            <button onClick={resetForm} className="bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl flex items-center justify-center">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isAdding && !editingId && (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 hide-scrollbar">
                    {Object.entries(groupedTemplates).map(([roomName, templates]) => (
                        <div key={roomName}>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">{roomName}</h3>
                            <div className="space-y-2">
                                {templates.map(t => (
                                    <div key={t.id} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition p-3 rounded-xl border border-slate-100">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-slate-700 truncate">{t.titel}</p>
                                                {t.festeZuweisung && (
                                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                                        {t.festeZuweisung} (Fest)
                                                    </span>
                                                )}
                                                {(!t.festeZuweisung && t.erlaubteNutzer && t.erlaubteNutzer.length > 0) && (
                                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                                                        Erlaubt: {t.erlaubteNutzer.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {frequencies.find(f => f.value === t.frequenz)?.label} • {t.xpBelohnung} XP
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-4">
                                            <button onClick={() => startEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-500 transition">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {taskTemplates.length === 0 && (
                        <div className="text-center py-8 text-slate-400 font-medium">
                            Keine Aufgaben in der Datenbank.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
