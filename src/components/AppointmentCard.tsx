import { Edit2, Trash2, Home } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Appointment } from '../types';
import UserAvatar from './UserAvatar';

interface AppointmentCardProps {
    appointment: Appointment;
    onEdit?: () => void;
    canEdit?: boolean;
}

export default function AppointmentCard({ appointment, onEdit, canEdit }: AppointmentCardProps) {
    const { users, deleteAppointment } = useStore();
    const user = users[appointment.userId];

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Termin wirklich löschen?')) {
            deleteAppointment(appointment.id);
        }
    };

    return (
        <div 
            onClick={() => canEdit && onEdit && onEdit()}
            className={`group h-full flex flex-col bg-white dark:bg-slate-800 rounded-2xl border-2 border-red-100 dark:border-red-900/30 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-red-300 dark:hover:border-red-700 active:scale-[0.98] ${canEdit ? 'cursor-pointer' : ''}`}
        >
            {/* Status Bar (Markant Rot) */}
            <div className="h-1.5 bg-red-500 w-full" />
            
            <div className="p-3.5 flex flex-col gap-3 flex-1">
                {/* Header: User & Actions */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                        <UserAvatar user={user} size={24} />
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md">
                            Termin: {user?.name}
                        </span>
                    </div>

                    {canEdit && (
                        <div className="flex gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Body: Title & Time */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{appointment.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Home size={14} className="text-red-500" />
                        <span>Rückkehr: <span className="text-red-600 dark:text-red-400 font-bold">{appointment.timeHome} Uhr</span></span>
                    </div>
                </div>

                {/* Footer: Note */}
                {appointment.note && (
                    <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-700/50">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed line-clamp-2">
                            "{appointment.note}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
