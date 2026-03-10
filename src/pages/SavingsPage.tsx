import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PieChart,
  ShoppingCart,
  Palmtree,
  Star,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendPushNotification } from '../services/ntfyService';
import type { Transaction, InvestmentEvent } from '../types';

export default function SavingsPage() {
  const { currentUser, users, transactions, addTransaction, investmentEvents } = useStore();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'deposit' | 'withdrawal' | 'investment'>('withdrawal');

  if (!currentUser) return null;
  const user = users[currentUser];
  const userTransactions = transactions.filter((t: Transaction) => t.userId === currentUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Bitte einen gültigen Betrag eingeben.');
      return;
    }

    if ((type === 'withdrawal' || type === 'investment') && numAmount > user.balance) {
      toast.error('Ganz so viel ist leider nicht in deiner Spardose!');
      return;
    }

    const currentEvent = selectedEventId ? investmentEvents.find(e => e.id === selectedEventId) : null;

    addTransaction({
      userId: currentUser,
      amount: numAmount,
      type,
      reason: reason || (type === 'investment' ? `Investition: ${currentEvent?.title}` : type === 'withdrawal' ? 'Freie Verfügung' : 'Sparen'),
      eventId: selectedEventId || undefined
    });

    // Notify admins
    const adminIds = Object.values(users as Record<string, any>).filter(u => u.role === 'admin').map(u => u.id);
    let notificationTitle = '';
    if (type === 'deposit') notificationTitle = '💰 Neue Einzahlung gemeldet';
    else if (type === 'withdrawal') notificationTitle = '💸 Auszahlung angefragt';
    else notificationTitle = `🚀 Neue Investition: ${currentEvent?.title}`;

    sendPushNotification({
      title: notificationTitle,
      message: `${user.name} möchte ${numAmount.toFixed(2)}€ ${type === 'deposit' ? 'einzahlen' : type === 'investment' ? 'investieren' : 'auszahlen'}. Grund: ${reason || 'Keiner'}`,
      priority: 4,
      tags: ['piggy-bank', type],
      clickUrl: '/admin/savings',
      targetUsers: adminIds
    });

    toast.success(type === 'withdrawal' ? 'Auszahlung angefragt!' : type === 'investment' ? 'Investition gemeldet!' : 'Einzahlung gemeldet!');
    setShowRequestModal(false);
    setSelectedEventId(null);
    setAmount('');
    setReason('');
  };

  const openInvestmentModal = (event: InvestmentEvent) => {
    setSelectedEventId(event.id);
    setType('investment');
    setShowRequestModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header mit Kontostand */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 rotate-3">
              <PiggyBank size={32} className="text-white" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Deine Spardose</p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight flex items-end gap-2 text-white">
                {(user.balance || 0).toFixed(2)}
                <span className="text-2xl md:text-3xl font-bold text-white/60 pb-1.5">€</span>
              </h1>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => { setType('deposit'); setSelectedEventId(null); setShowRequestModal(true); }}
              className="px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl font-bold transition-all active:scale-95 border border-white/20 flex items-center gap-2"
            >
              <ArrowDownLeft size={20} />
              Einzahlen
            </button>
            <button 
              onClick={() => { setType('withdrawal'); setSelectedEventId(null); setShowRequestModal(true); }}
              className="px-6 py-4 bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl font-bold transition-all active:scale-95 shadow-md shadow-indigo-900/10 flex items-center gap-2"
            >
              <ArrowUpRight size={20} />
              Abheben
            </button>
          </div>
        </div>
        
        {/* Dekorative Elemente */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      {/* Investitions-Ereignisse */}
      {investmentEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <Star size={24} className="text-amber-500 fill-amber-500" />
            Aktuelle Spar-Ziele
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1 custom-scrollbar">
            {investmentEvents.map(event => (
              <button
                key={event.id}
                onClick={() => openInvestmentModal(event)}
                className="flex-shrink-0 w-64 bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
                    {event.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{event.title}</h3>
                    <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md w-max mt-1 ${
                      event.type === 'vacation' ? 'bg-blue-100 text-blue-600' : 
                      event.type === 'shopping' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {event.type === 'vacation' ? 'Urlaub' : event.type === 'shopping' ? 'Einkauf' : 'Ziel'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">{event.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Jetzt Investieren</span>
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-200 dark:shadow-none">
                    <Plus size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Historie */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <History size={24} className="text-indigo-500" />
              Kontobewegungen
            </h2>
          </div>

          <div className="space-y-4">
            {userTransactions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Wallet size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Noch keine Buchungen vorhanden.</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Hier siehst du später alle deine Ein- und Auszahlungen.</p>
              </div>
            ) : (
              userTransactions.map((t: Transaction) => (
                <div key={t.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      t.type === 'deposit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      t.type === 'investment' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      t.type === 'withdrawal' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {t.type === 'deposit' ? <ArrowDownLeft size={20} /> : 
                       t.type === 'investment' ? <PieChart size={20} /> :
                       t.type === 'withdrawal' ? <ArrowUpRight size={20} /> :
                       <TrendingUp size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{t.reason}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(t.timestamp).toLocaleDateString()} um {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-black ${
                      t.type === 'deposit' || (t.type === 'adjustment' && t.amount > 0) ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {t.type === 'deposit' || (t.type === 'adjustment' && t.amount > 0) ? '+' : '-'}{(Math.abs(t.amount) || 0).toFixed(2)}€
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {t.status === 'pending' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                          <Clock size={10} /> Wartet
                        </span>
                      )}
                      {t.status === 'completed' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md">
                          <CheckCircle2 size={10} /> Gebucht
                        </span>
                      )}
                      {t.status === 'rejected' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-md">
                          <XCircle size={10} /> Abgelehnt
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info-Card / Tipps */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">So funktioniert's</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-black text-slate-500">1</span>
                Gib deinen Eltern das Taschengeld oder gespartes Geld "in echt".
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-black text-slate-500">2</span>
                Trage hier eine "Einzahlung" ein. Deine Eltern bestätigen das dann in der App.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-black text-slate-500">3</span>
                Investiere dein Geld in tolle Spar-Ziele wie Urlaube oder besondere Einkäufe!
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-black text-slate-500">4</span>
                Möchtest du dir etwas kaufen? Frage hier eine "Auszahlung" an.
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] p-6 border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="font-black text-indigo-900 dark:text-indigo-100 mb-2">Spar-Tipp! 💡</h3>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed font-medium">
              Investieren ist super! So sparst du auf etwas ganz Bestimmtes und hast später viel mehr Spaß daran.
            </p>
          </div>
        </div>
      </div>

      {/* Modal zum Anfragen / Investieren */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`p-6 text-white ${
              type === 'deposit' ? 'bg-emerald-500' : 
              type === 'investment' ? 'bg-indigo-500' : 'bg-rose-500'
            }`}>
              <h3 className="text-2xl font-black">
                {type === 'deposit' ? 'Geld einzahlen' : 
                 type === 'investment' ? 'In Ziel investieren' : 'Geld abheben'}
              </h3>
              <p className="text-white/80 text-sm font-medium">
                {type === 'investment' ? investmentEvents.find(e => e.id === selectedEventId)?.title : 'Gib an, wie viel und wofür.'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Betrag in Euro</label>
                <div className="relative">
                  <input
                    autoFocus
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-2xl font-black text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors pl-12"
                    placeholder="0.00"
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">€</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {type === 'investment' ? 'Wofür investierst du? (z.B. Eis essen)' : 'Grund (optional)'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px]"
                  placeholder={
                    type === 'investment' ? 'z.B. Um mir im Urlaub etwas kaufen zu können' :
                    type === 'withdrawal' ? 'Wofür brauchst du das Geld?' : 
                    'Woher kommt das Geld?'
                  }
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
                    type === 'deposit' ? 'bg-emerald-500 shadow-emerald-200' : 
                    type === 'investment' ? 'bg-indigo-500 shadow-indigo-200' :
                    'bg-rose-500 shadow-rose-200'
                  }`}
                >
                  {type === 'deposit' ? 'Einzahlen' : 
                   type === 'investment' ? 'Investieren' : 'Anfragen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
