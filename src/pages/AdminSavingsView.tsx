import { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { 
  PiggyBank, 
  Check, 
  X, 
  TrendingDown,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  PieChart,
  Wallet,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { UserId, Transaction } from '../types';
import AdminInvestmentManager from './AdminInvestmentManager';

export default function AdminSavingsView() {
  const { users, transactions, updateTransactionStatus, adjustBalance, currentUser, resetBanking } = useStore();
  const [selectedUser, setSelectedUser] = useState<UserId | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'banking' | 'investments'>('banking');

  // Nur Kinder anzeigen (Tayler und Fee)
  const kids: UserId[] = ['Tayler', 'Fee'];
  
  const pendingTransactions = transactions.filter((t: Transaction) => t.status === 'pending');
  const recentTransactions = transactions.filter((t: Transaction) => t.status !== 'pending').slice(0, 10);

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) return;

    adjustBalance(selectedUser, amount);
    publishEvent('BALANCE_ADJUSTED', { userId: selectedUser, amount });
    toast.success('Kontostand angepasst!');
    setShowAdjustModal(false);
    setAdjustAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <PiggyBank size={32} className="text-indigo-600" />
            Spardosen-Verwaltung
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Verwalte das ersparte Geld deiner Kinder.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Möchtest du wirklich ALLE Kontostände auf 0.00€ setzen und den gesamten Verlauf löschen?')) {
                resetBanking();
                publishEvent('BANKING_RESET', {});
                toast.success('Banking zurückgesetzt!');
              }
            }}
            className="px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl font-bold text-sm transition-all hover:bg-rose-200 flex items-center gap-2"
          >
            <Trash2 size={16} /> Alles zurücksetzen
          </button>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('banking')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'banking' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Wallet size={16} /> Banking
          </button>
          <button 
            onClick={() => setActiveTab('investments')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'investments' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <PieChart size={16} /> Investments
          </button>
        </div>
      </div>

      {activeTab === 'banking' ? (
        <>
          {/* Übersicht Kinder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kids.map(kidId => {
              const user = users[kidId];
              if (!user) return null;
              return (
                <div key={kidId} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg`} style={{ backgroundColor: user.color }}>
                        {user.name[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h3>
                        <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">Aktuelles Guthaben</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                        {(user.balance || 0).toFixed(2)}€
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3 relative z-10">
                    <button 
                      onClick={() => { setSelectedUser(kidId); setShowAdjustModal(true); }}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> Korrektur
                    </button>
                  </div>

                  {/* Deko */}
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    <PiggyBank size={80} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ausstehende Anfragen */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Clock size={24} className="text-amber-500" />
              Ausstehende Anfragen
              {pendingTransactions.length > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">{pendingTransactions.length}</span>
              )}
            </h2>

            {pendingTransactions.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-medium italic">Alle Anfragen wurden bearbeitet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTransactions.map((t: Transaction) => (
                  <div key={t.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/30 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${t.type === 'deposit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : t.type === 'investment' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                        {t.type === 'deposit' ? <TrendingUp size={28} /> : (t.type === 'investment' ? <PieChart size={28} /> : <TrendingDown size={28} />)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-800 dark:text-white">{users[t.userId]?.name}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${t.type === 'deposit' ? 'bg-emerald-500 text-white' : t.type === 'investment' ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'}`}>
                            {t.type === 'deposit' ? 'Einzahlung' : t.type === 'investment' ? 'Investment' : 'Auszahlung'}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-tight">"{t.reason}"</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                          {new Date(t.timestamp).toLocaleDateString()} um {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className={`text-3xl font-black ${t.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'deposit' ? '+' : '-'}{(t.amount || 0).toFixed(2)}€
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            updateTransactionStatus(t.id, 'rejected', currentUser || 'Ric');
                            publishEvent('TRANSACTION_STATUS_UPDATED', { transactionId: t.id, status: 'rejected', adminId: currentUser || 'Ric' });
                          }}
                          className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-all flex items-center justify-center"
                          title="Ablehnen"
                        >
                          <X size={24} />
                        </button>
                        <button 
                          onClick={() => {
                            updateTransactionStatus(t.id, 'completed', currentUser || 'Ric');
                            publishEvent('TRANSACTION_STATUS_UPDATED', { transactionId: t.id, status: 'completed', adminId: currentUser || 'Ric' });
                          }}
                          className="w-12 h-12 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center"
                          title="Bestätigen"
                        >
                          <Check size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Letzte Buchungen */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ChevronRight size={20} className="text-slate-400" />
              Verlauf
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Kind</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Betrag</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Grund</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {recentTransactions.map((t: Transaction) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: users[t.userId]?.color }}>
                            {users[t.userId]?.name[0]}
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{users[t.userId]?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black text-sm ${t.type === 'deposit' || (t.type === 'adjustment' && t.amount > 0) ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.type === 'deposit' || (t.type === 'adjustment' && t.amount > 0) ? '+' : '-'}{Math.abs(t.amount || 0).toFixed(2)}€
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.reason}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-500 dark:bg-rose-900/20'}`}>
                          {t.status === 'completed' ? 'Erledigt' : 'Abgelehnt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <AdminInvestmentManager />
      )}

      {/* Anpassungs-Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdjustModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-800 text-white">
              <h3 className="text-2xl font-black">Kontostand anpassen</h3>
              <p className="text-white/60 text-sm font-medium">Manuelle Korrektur für {users[selectedUser!]?.name}.</p>
            </div>
            
            <form onSubmit={handleAdjust} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Betrag (positiv oder negativ)</label>
                <div className="relative">
                  <input
                    autoFocus
                    type="number"
                    step="0.01"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-2xl font-black text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors pl-12"
                    placeholder="0.00"
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">€</div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                >
                  Übernehmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
