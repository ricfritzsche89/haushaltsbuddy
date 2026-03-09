import React, { useState } from 'react';
import { sendPushNotification } from '../services/ntfyService';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPushMessageCard() {
    const [pushTarget, setPushTarget] = useState('Alle Kinder');
    const [pushTitle, setPushTitle] = useState('');
    const [pushMessage, setPushMessage] = useState('');

    const handleSendPush = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pushMessage.trim()) return;

        let finalTitle = pushTitle.trim() || 'Familien Info';
        if (pushTarget !== 'Alle' && pushTarget !== 'Alle Kinder') {
            finalTitle = `An ${pushTarget}: ${finalTitle}`;
        }

        await sendPushNotification({
            title: finalTitle,
            message: pushMessage,
            priority: 4,
            tags: ['speech_balloon']
        });

        toast.success('Nachricht gesendet!');
        setPushTitle('');
        setPushMessage('');
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-blue-50 dark:border-slate-800 relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Bell size={20} className="text-blue-500" /> Familien Nachricht
            </h2>

            <form onSubmit={handleSendPush} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empfänger (Hinweis im Titel)</label>
                    <select
                        value={pushTarget}
                        onChange={e => setPushTarget(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-colors"
                    >
                        <option value="Alle Kinder">Alle Kinder</option>
                        <option value="Alle">Die ganze Familie</option>
                        <option value="Tayler">Tayler</option>
                        <option value="Fee">Fee</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titel (Optional)</label>
                    <input
                        type="text"
                        value={pushTitle}
                        onChange={e => setPushTitle(e.target.value)}
                        placeholder="z.B. Zimmer aufräumen!"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nachricht</label>
                    <textarea
                        value={pushMessage}
                        onChange={e => setPushMessage(e.target.value)}
                        placeholder="Was gibt es Wichtiges?"
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-colors"
                    />
                </div>

                <button type="submit" disabled={!pushMessage.trim()} className="w-full bg-blue-500 text-white font-bold py-3 mt-2 rounded-xl active:bg-blue-600 transition disabled:opacity-50">
                    Nachricht absenden
                </button>
            </form>
        </div>
    );
}
