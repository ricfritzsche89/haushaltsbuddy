import { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { SmartphoneNfc, Plus, Flag, AlertTriangle, Clock } from 'lucide-react';
import type { Penalty, OffenseReport } from '../types';
import toast from 'react-hot-toast';

import PenaltyCard, { formatDuration, FormatCountdown } from '../components/PenaltyCard';
import OffenseReportCard from '../components/OffenseReportCard';
import CreatePenaltyModal from '../components/CreatePenaltyModal';
import CreateReportModal from '../components/CreateReportModal';

function isActive(p: Penalty) {
    if (!p.activatedAt) return false;
    return Date.now() < p.activatedAt + p.durationMinutes * 60000;
}

export default function Penalties() {
    const { penalties, offenseReports, users, currentUser, deletePenalty, activatePenalty, updateOffenseReport } = useStore();
    const isAdmin = Boolean(currentUser && users[currentUser]?.role === 'admin');

    // Modals
    const [showBanForm, setShowBanForm] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);

    // Auto-fill Ban form from Report
    const [pendingBanData, setPendingBanData] = useState<{ userId: import('../types').UserId, reason: string, reportId: string } | null>(null);

    if (!currentUser) return null;

    const myPenalties = isAdmin
        ? [...penalties].sort((a, b) => b.timestamp - a.timestamp)
        : penalties.filter(p => p.userId === currentUser).sort((a, b) => b.timestamp - a.timestamp);

    const activePenalty = !isAdmin ? penalties.find(p => p.userId === currentUser && isActive(p)) : undefined;
    const pendingReports = offenseReports.filter(r => r.status === 'pending');

    const handleActivate = (p: Penalty) => {
        const now = Date.now();
        activatePenalty(p.id, now);
        publishEvent('PENALTY_ACTIVATED', { penaltyId: p.id, timestamp: now });

        sendPushNotification({
            title: `🕒 Timer gestartet für ${users[p.userId]?.name}`,
            message: `Das Handyverbot ist nun aktiv (${formatDuration(p.durationMinutes)})`,
            priority: 4,
            tags: ['hourglass_flowing_sand'],
            click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/penalties'
        });
        toast.success('Timer gestartet!');
    };

    const handleDeletePenalty = (id: string, name: string) => {
        if (window.confirm(`Strafe "${name}" wirklich löschen?`)) {
            deletePenalty(id);
            publishEvent('PENALTY_REMOVED', { penaltyId: id });
            toast.success('Strafe gelöscht');
        }
    };

    const openBanFromReport = (report: OffenseReport) => {
        setPendingBanData({ userId: report.reportedUser, reason: report.reason, reportId: report.id });
        setShowBanForm(true);
    };

    const rejectReport = (reportId: string) => {
        updateOffenseReport(reportId, { status: 'rejected' });
        publishEvent('OFFENSE_REPORT_UPDATED', { reportId, updates: { status: 'rejected' } });
        toast('Meldung abgelehnt', { icon: '👍' });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-4 transition-colors">
            {/* Header */}
            <div className="bg-gradient-to-br from-red-500 to-rose-700 px-6 pt-10 pb-16 text-white rounded-b-3xl relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3"><SmartphoneNfc size={28} /> Bestrafungen</h1>
                        <p className="text-red-100 font-medium mt-1">{isAdmin ? 'Verbote verwalten & verhängen' : 'Deine aktuellen Verbote'}</p>
                    </div>
                    <div className="flex gap-2">
                        {!isAdmin && (
                            <button onClick={() => setShowReportForm(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/10 backdrop-blur px-3 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95">
                                <Flag size={16} /> Melden
                            </button>
                        )}
                        {isAdmin && (
                            <button onClick={() => { setPendingBanData(null); setShowBanForm(true); }} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95">
                                <Plus size={18} /> Verhängen
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active ban card for kids */}
            {!isAdmin && activePenalty && activePenalty.activatedAt && (
                <div className="-mt-8 mx-6 z-10 relative mb-4">
                    <div className="bg-red-500 text-white rounded-3xl p-5 shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><AlertTriangle size={24} /></div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-red-200">Aktives Verbot</p>
                                <p className="font-extrabold text-lg">{formatDuration(activePenalty.durationMinutes)}</p>
                            </div>
                        </div>
                        <p className="text-sm text-red-100 mb-2">📍 Grund: <span className="text-white font-bold">{activePenalty.reason}</span></p>
                        <div className="bg-black/20 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-mono">
                            <Clock size={14} /> Verbleibend: <FormatCountdown endMs={activePenalty.activatedAt + activePenalty.durationMinutes * 60000} />
                        </div>
                    </div>
                </div>
            )}

            {/* Admin: Pending Reports */}
            {isAdmin && pendingReports.length > 0 && (
                <div className="-mt-8 mx-6 z-10 relative mb-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-red-500 px-1">🚨 Offene Meldungen ({pendingReports.length})</p>
                    {pendingReports.map(r => (
                        <OffenseReportCard
                            key={r.id}
                            report={r}
                            isAdmin={isAdmin}
                            users={users}
                            onReject={rejectReport}
                            onBan={openBanFromReport}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showBanForm && (
                <CreatePenaltyModal
                    onClose={() => { setShowBanForm(false); setPendingBanData(null); }}
                    initialUserId={pendingBanData?.userId}
                    initialReason={pendingBanData?.reason}
                    offenseReportIdToApprove={pendingBanData?.reportId}
                />
            )}
            {showReportForm && <CreateReportModal onClose={() => setShowReportForm(false)} />}

            {/* Penalty list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 -mt-6 relative z-10">

                {/* Separator */}
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 pt-2">Aktuelle Bestrafungen</p>

                {myPenalties.length === 0 && (
                    <div className="text-center text-slate-400 dark:text-slate-600 py-16">
                        <SmartphoneNfc size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">{isAdmin ? 'Noch keine Verbote verhängt.' : 'Du hast kein aktives Verbot! 🎉'}</p>
                    </div>
                )}

                {myPenalties.map(p => (
                    <PenaltyCard
                        key={p.id}
                        penalty={p}
                        isActive={isActive(p)}
                        isAdmin={isAdmin}
                        users={users}
                        onActivate={handleActivate}
                        onDelete={handleDeletePenalty}
                    />
                ))}
            </div>
        </div>
    );
}
