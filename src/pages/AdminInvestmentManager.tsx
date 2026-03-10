import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Trash2, 
  Briefcase, 
  ShoppingCart, 
  Palmtree, 
  PieChart,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInvestmentManager() {
  const { investmentEvents, addInvestmentEvent, deleteInvestmentEvent, transactions, users } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏖️');
  const [newType, setNewType] = useState<'vacation' | 'shopping' | 'other'>('vacation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInvestmentEvent({
      title: newTitle,
      description: newDesc,
      emoji: newEmoji,
      type: newType,
    });
    toast.success('Ereignis erstellt!');
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const getEventTotal = (eventId: string) => {
    return transactions
      .filter(t => t.type === 'investment' && t.eventId === eventId && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getInvestments = (eventId: string) => {
    return transactions.filter(t => t.type === 'investment' && t.eventId === eventId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <PieChart size={28} className="text-indigo-600" />
            Investitions-Ereignisse
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Erstelle Ziele, in die Kinder investieren können.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={20} /> Neu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {investmentEvents.length === 0 ? (
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Info size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Bisher wurden keine Ereignisse erstellt.</p>
          </div>
        ) : (
          investmentEvents.map(event => {
            const total = getEventTotal(event.id);
            const investments = getInvestments(event.id);
            
            return (
              <div key={event.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                      {event.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{event.title}</h3>
                      <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{event.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('Ereignis wirklich löschen?')) deleteInvestmentEvent(event.id);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-slate-50 dark:border-slate-700 pt-6">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Gesamt investiert</p>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{total.toFixed(2)}€</p>
                  </div>
                  <div className="flex -space-x-2">
                    {/* Unique users who invested */}
                    {Array.from(new Set(investments.map(i => i.userId))).map(userId => (
                      <div key={userId} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: users[userId]?.color }}>
                        {users[userId]?.name[0]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details-Liste */}
                {investments.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Investitionen ({investments.length})</p>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {investments.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                          <span className="font-bold text-slate-600 dark:text-slate-400">{users[inv.userId]?.name}: "{inv.reason}"</span>
                          <span className="font-black text-indigo-500">{inv.amount.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-800 text-white">
              <h3 className="text-2xl font-black">Neues Ereignis</h3>
              <p className="text-white/60 text-sm font-medium">Erstelle ein Ziel für Investitionen.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['🏖️', '🛒', '🏔️', '🎢', '🍦', '🎮', '🚗', '🎡'].map(emoji => (
                  <button 
                    key={emoji}
                    type="button"
                    onClick={() => setNewEmoji(emoji)}
                    className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${newEmoji === emoji ? 'bg-indigo-600 scale-110 shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Titel</label>
                <input
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  placeholder="z.B. Sommerurlaub 2024"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Beschreibung</label>
                <input
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Wofür wird gespart?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategorie</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewType('vacation')}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${newType === 'vacation' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                  >
                    <Palmtree size={18} /> Urlaub
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewType('shopping')}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${newType === 'shopping' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                  >
                    <ShoppingCart size={18} /> Einkauf
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewType('other')}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${newType === 'other' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                  >
                    <Briefcase size={18} /> Sonstiges
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
