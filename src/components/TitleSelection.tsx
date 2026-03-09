import { Check, Tag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { ALLE_TITEL } from '../types';

export default function TitleSelection() {
    const { currentUser, users, setActiveTitle } = useStore();
    if (!currentUser) return null;

    const userObj = users[currentUser];
    const unlockedIds = userObj.unlockedTitles || [];

    // Exklusive Starttitel anderer User ausblenden (nurFuerUser gesetzt und != currentUser)
    const unlockedTitels = ALLE_TITEL.filter(t =>
        unlockedIds.includes(t.id) && (!t.nurFuerUser || t.nurFuerUser === currentUser)
    );
    const lockedTitels = ALLE_TITEL.filter(t =>
        !unlockedIds.includes(t.id) && (!t.nurFuerUser || t.nurFuerUser === currentUser)
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Tag size={20} className="text-purple-500" /> Deine Titel
            </h3>
            {unlockedTitels.length === 0 ? (
                <p className="text-slate-400 text-sm">Noch keine Titel freigeschaltet. Sammle XP!</p>
            ) : (
                <div className="space-y-2">
                    {unlockedTitels.map(t => (
                        <button key={t.id} onClick={() => { setActiveTitle(currentUser, t.id); publishEvent('USER_PROFILE_UPDATED', { userId: currentUser, updates: { activeTitle: t.id } }); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${userObj.activeTitle === t.id ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                            <span className="text-2xl">{t.emoji}</span>
                            <div className="text-left flex-1">
                                <p className={`font-bold text-sm ${userObj.activeTitle === t.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>{t.name}</p>
                                <p className="text-xs text-slate-400">{t.beschreibung}</p>
                            </div>
                            {userObj.activeTitle === t.id && <Check size={18} className="text-purple-500 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Locked previews */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Noch freizuschalten</p>
                <div className="space-y-2">
                    {lockedTitels.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 opacity-50 border border-slate-100 dark:border-slate-800">
                            <span className="text-xl grayscale">🔒</span>
                            <div>
                                <p className="font-bold text-sm text-slate-500 dark:text-slate-400">{t.name}</p>
                                <p className="text-xs text-slate-400">{t.xpRequired} XP benötigt</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
