import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Store, Gift, Coins, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { publishEvent } from '../services/syncService';

export default function Shop() {
    const { users, currentUser, shopItems, purchases, purchaseItem } = useStore();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    if (!currentUser) return null;
    const user = users[currentUser];

    // Get user's active/pending purchases to show status
    const pendingPurchases = purchases.filter(p => p.userId === currentUser && p.status === 'pending');

    const handlePurchase = (itemId: string, cost: number) => {
        if (user.xp < cost) {
            toast.error('Nicht genug XP! 😢');
            return;
        }

        if (window.confirm('Möchtest du diese Belohnung wirklich einlösen?')) {
            purchaseItem(currentUser, itemId, cost);

            // Getting the newly created purchase ID to sync correctly
            const newPurchase = useStore.getState().purchases.find(
                p => p.userId === currentUser && p.itemId === itemId && p.status === 'pending'
            );

            if (newPurchase) {
                publishEvent('SHOP_ITEM_PURCHASED', {
                    purchaseId: newPurchase.id,
                    userId: currentUser,
                    itemId,
                    cost
                });
                publishEvent('USER_PROFILE_UPDATED', {
                    userId: currentUser,
                    updates: { xp: user.xp - cost }
                });
                toast.success('Gekauft! Eltern werden benachrichtigt. 🎉');
                setSelectedItem(null);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-12 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 px-6 pt-10 pb-4 shadow-sm sticky top-0 z-10 transition-colors border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Store size={28} className="text-amber-500" /> Belohnungen
                    </h1>
                    <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-bold px-3 py-1.5 rounded-full shadow-sm border border-amber-200 dark:border-amber-800/60">
                        <Coins size={16} />
                        <span>{user.xp} XP</span>
                    </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">Tausche deine hart verdienten XP gegen coole Belohnungen ein!</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

                {/* Pending Actions Alert */}
                <AnimatePresence>
                    {pendingPurchases.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-2xl p-4 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-blue-800 dark:text-blue-300 font-bold text-sm">Warten auf Eltern</h3>
                                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                                        Du hast {pendingPurchases.length} Belohnung(en) eingelöst. Ein Admin muss diese nun für dich aktivieren.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shop Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shopItems.map(item => {
                        const canAfford = user.xp >= item.cost;
                        const isSelected = selectedItem === item.id;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                onClick={() => setSelectedItem(isSelected ? null : item.id)}
                                className={`
                                    relative bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border-2 transition-all cursor-pointer overflow-hidden
                                    ${isSelected ? 'border-amber-400 scale-[1.02] shadow-md z-10' : 'border-slate-100 dark:border-slate-800 hover:border-amber-200'}
                                    ${!canAfford && !isSelected ? 'opacity-60 grayscale-[50%]' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-amber-100 dark:border-amber-800/50">
                                        {item.emoji}
                                    </div>
                                    <div className={`font-bold flex items-center gap-1.5 px-3 py-1 rounded-full text-sm shadow-sm ${canAfford ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                                        <Coins size={14} />
                                        {item.cost}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 leading-tight">{item.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-snug line-clamp-2">{item.description}</p>

                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePurchase(item.id, item.cost); }}
                                                disabled={!canAfford}
                                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm
                                                    ${canAfford ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}
                                                `}
                                            >
                                                {canAfford ? (
                                                    <><Gift size={18} /> Jetzt einlösen</>
                                                ) : (
                                                    'Nicht genug XP'
                                                )}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
