import type { OffenseReport } from '../types';
import { ShieldAlert, Check, X, Ban } from 'lucide-react';
import UserAvatar from './UserAvatar';

interface OffenseReportCardProps {
    report: OffenseReport;
    isAdmin: boolean;
    users: Record<string, any>;
    onReject: (id: string) => void;
    onBan: (r: OffenseReport) => void;
}

export default function OffenseReportCard({ report, isAdmin, users, onReject, onBan }: OffenseReportCardProps) {
    const reporter = users[report.reportedBy];
    const accused = users[report.reportedUser];

    const getStatusStyle = (s: string) => {
        if (s === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50';
        if (s === 'confirmed') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50';
    };

    const getStatusIcon = (s: string) => {
        if (s === 'pending') return <ShieldAlert size={14} className="animate-pulse" />;
        if (s === 'confirmed') return <Check size={14} />;
        return <X size={14} />;
    };

    return (
        <div className={`p-4 sm:p-5 rounded-3xl border-2 shadow-sm transition-all ${report.status === 'pending' ? 'bg-amber-50/50 dark:bg-slate-900 border-amber-200 dark:border-amber-900/50' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex items-center gap-3 shrink-0">
                    <UserAvatar name={accused?.name || 'Unbekannt'} color={accused?.color || '#ccc'} size="md" />
                    <div className="sm:hidden">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusStyle(report.status)}`}>
                            {getStatusIcon(report.status)}
                            {report.status === 'pending' ? 'Offen' : report.status === 'confirmed' ? 'Bestraft' : 'Abgelehnt'}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg mb-1 break-words">{report.reason}</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded-md">Gemeldet von {reporter?.name || 'Unbekannt'}</p>
                        </div>
                        <div className="hidden sm:block">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-sm ${getStatusStyle(report.status)}`}>
                                {getStatusIcon(report.status)}
                                {report.status === 'pending' ? 'Offener Fall' : report.status === 'confirmed' ? 'Bestraft' : 'Abgelehnt'}
                            </span>
                        </div>
                    </div>

                    {report.photoUrl && (
                        <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative group bg-black/5">
                            <img src={report.photoUrl} alt="Beweis" className="w-full h-auto max-h-[400px] object-contain" />
                        </div>
                    )}

                    {isAdmin && report.status === 'pending' && (
                        <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => onBan(report)}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 font-bold py-2.5 px-3 rounded-xl transition-colors text-sm shadow-sm"
                            >
                                <Ban size={16} /> Bestrafen
                            </button>
                            <button
                                onClick={() => onReject(report.id)}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-bold py-2.5 px-3 rounded-xl transition-colors text-sm shadow-sm"
                            >
                                <X size={16} /> Ablehnen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
