import { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { CheckCircle2, Store, Plus, Pencil, Trash2, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ShopItem } from '../types';

const EMOJI_OPTIONS = ['🎮', '🍕', '🍫', '🎬', '🛒', '🚀', '⭐', '🎁', '🎯', '🎨', '🎤', '🍦', '🎠', '💤', '🏖️', '🏆', '💸', '🎧', '📱', '🍿'];

const DEFAULT_FORM: Partial<ShopItem> = {
    name: '',
    emoji: '🎁',
    description: '',
    cost: 100,
};

export default function AdminShopView() {
    const { users, shopItems, purchases, redeemPurchase, addShopItem, updateShopItem, deleteShopItem } = useStore();
    const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');
    const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<ShopItem>>(DEFAULT_FORM);

    const pendingPurchases = purchases.filter(p => p.status === 'pending');

    const handleRedeem = (purchaseId: string) => {
        if (window.confirm('Wurde diese Belohnung wirklich eingelöst/erledigt?')) {
            redeemPurchase(purchaseId);
            publishEvent('SHOP_PURCHASE_REDEEMED', { purchaseId });
            toast.success('Belohnung als erledigt markiert!');
        }
    };

    const openCreate = () => {
        setEditingItem(null);
        setForm(DEFAULT_FORM);
        setShowForm(true);
    };

    const openEdit = (item: ShopItem) => {
        setEditingItem(item);
        setForm({ name: item.name, emoji: item.emoji, description: item.description, cost: item.cost });
        setShowForm(true);
    };

    const handleSave = () => {
        if (!form.name?.trim()) { toast.error('Name fehlt!'); return; }
        if (!form.cost || form.cost < 1) { toast.error('Preis muss mindestens 1 XP sein!'); return; }

        if (editingItem) {
            const updates = { name: form.name!, emoji: form.emoji!, description: form.description!, cost: form.cost! };
            updateShopItem(editingItem.id, updates);
            publishEvent('SHOP_ITEM_UPDATED', { itemId: editingItem.id, updates });
            toast.success('Belohnung aktualisiert! ✨');
        } else {
            const newItem: ShopItem = {
                id: crypto.randomUUID(),
                name: form.name!,
                emoji: form.emoji!,
                description: form.description || '',
                cost: form.cost!,
            };
            addShopItem(newItem);
            publishEvent('SHOP_ITEM_ADDED', newItem);
            toast.success('Neue Belohnung erstellt! 🎁');
        }
        setShowForm(false);
        setEditingItem(null);
        setForm(DEFAULT_FORM);
    };

    const handleDelete = (itemId: string, itemName: string) => {
        if (window.confirm(`"${itemName}" wirklich löschen?`)) {
            deleteShopItem(itemId);
            publishEvent('SHOP_ITEM_DELETED', { itemId });
            toast.success('Belohnung gelöscht.');
        }
    };

    return (
        <div className="space-y-4">
            {/* Tab Bar */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-amber-500 text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                    <CheckCircle2 size={15} />
                    Bestellungen
                    {pendingPurchases.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {pendingPurchases.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'catalog' ? 'bg-amber-500 text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                    <Package size={15} />
                    Belohnungen verwalten
                </button>
            </div>

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-amber-50 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                        <Store size={20} className="text-amber-500" /> Offene Bestellungen
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
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: user.color }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{user.name}</span>
                                                <span className="text-xs text-slate-400">hat bestellt:</span>
                                            </div>
                                            <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <span>{item.emoji}</span> {item.name}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {new Date(purchase.timestamp).toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <button onClick={() => handleRedeem(purchase.id)} className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 p-3 rounded-xl transition-colors">
                                            <CheckCircle2 size={24} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── CATALOG TAB ── */}
            {activeTab === 'catalog' && (
                <div className="space-y-3">
                    {/* Add Button */}
                    <button onClick={openCreate} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold rounded-2xl shadow transition-all">
                        <Plus size={18} /> Neue Belohnung erstellen
                    </button>

                    {/* Item List */}
                    {shopItems.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-8">Noch keine Belohnungen erstellt.</p>
                    ) : (
                        shopItems.map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                                <span className="text-3xl">{item.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                                    {item.description && <p className="text-xs text-slate-400 truncate">{item.description}</p>}
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{item.cost} XP</span>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => openEdit(item)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 transition-colors">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id, item.name)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center pb-24 px-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                                {editingItem ? 'Belohnung bearbeiten' : 'Neue Belohnung'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Emoji Picker */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 mb-2">EMOJI</p>
                            <div className="flex flex-wrap gap-2">
                                {EMOJI_OPTIONS.map(e => (
                                    <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                                        className={`text-xl p-1.5 rounded-xl transition-all ${form.emoji === e ? 'bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-400 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input
                            type="text"
                            value={form.name || ''}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Name (z.B. Spielstunde)"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <textarea
                            value={form.description || ''}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Beschreibung (optional)"
                            rows={2}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                        />
                        <div>
                            <p className="text-xs font-bold text-slate-500 mb-1">PREIS IN XP</p>
                            <input
                                type="number"
                                value={form.cost || ''}
                                onChange={e => setForm(f => ({ ...f, cost: parseInt(e.target.value) || 0 }))}
                                min={1}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>

                        <button onClick={handleSave} className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-2xl transition-all active:scale-95 shadow">
                            {editingItem ? 'Änderungen speichern' : 'Belohnung erstellen'} ✨
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
