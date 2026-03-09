import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { CheckCircle2, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminShopView() {
    const { users, shopItems, purchases, redeemPurchase } = useStore();

    // Show only pending purchases for admins to process
    const pendingPurchases = purchases.filter(p => p.status === 'pending');

    const handleRedeem = (purchaseId: string) => {
        if (window.confirm('Wurde diese Belohnung wirklich eingelöst/erledigt?')) {
            redeemPurchase(purchaseId);
            publishEvent('SHOP_PURCHASE_REDEEMED', { purchaseId });
            toast.success('Belohnung als erledigt markiert!');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-amber-50 dark:border-slate-800 relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Store size={20} className="text-amber-500" /> Offene Shop-Bestellungen
            </h2>

            {pendingPurchases.length === 0 ? (
                <p className="text-sm text-slate-500">Keine offenen Bestellungen der Kinder vorhanden.</p>
            ) : (
                <div className="space-y-3">
                    {pendingPurchases.map(purchase => {
                        const user = users[purchase.userId];
                        const item = shopItems.find(i => i.id === purchase.itemId);

                        if (!user || !item) return null;

                        return (
                            <div key={purchase.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/20"
                                            style={{ backgroundColor: user.color }}
                                        >
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{user.name}</span>
                                        <span className="text-xs text-slate-400">hat bestellt:</span>
                                    </div>
                                    <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <span>{item.emoji}</span> {item.name}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Bestellt: {new Date(purchase.timestamp).toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRedeem(purchase.id)}
                                    className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 p-3 rounded-xl transition-colors shrink-0"
                                    title="Als erledigt markieren"
                                >
                                    <CheckCircle2 size={24} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
