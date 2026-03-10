import { useState } from 'react';
import { X, Clock, Check, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Appointment, DayOfWeek } from '../types';
import { sendPushNotification } from '../services/ntfyService';
import toast from 'react-hot-toast';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

interface CreateAppointmentModalProps {
    onClose: () => void;
    appointmentToEdit?: Appointment;
}

export default function CreateAppointmentModal({ onClose, appointmentToEdit }: CreateAppointmentModalProps) {
    const { currentUser, addAppointment, updateAppointment, users } = useStore();
    const [title, setTitle] = useState(appointmentToEdit?.title || '');
    const [timeHome, setTimeHome] = useState(appointmentToEdit?.timeHome || '');
    const [wochentag, setWochentag] = useState<DayOfWeek>(appointmentToEdit?.wochentag || DAYS[(new Date().getDay() + 6) % 7]);
    const [note, setNote] = useState(appointmentToEdit?.note || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        if (!title.trim() || !timeHome.trim()) {
            toast.error('Bitte Titel und Uhrzeit angeben!');
            return;
        }

        if (appointmentToEdit) {
            updateAppointment(appointmentToEdit.id, {
                title,
                timeHome,
                wochentag,
                note,
            });
            toast.success('Termin aktualisiert! 🕒');
        } else {
            const newAppointment: Appointment = {
                id: Math.random().toString(36).substr(2, 9),
                userId: currentUser,
                title,
                timeHome,
                wochentag,
                timestamp: Date.now(),
                note,
            };
            addAppointment(newAppointment);

            // Notify Admins
            const userName = users[currentUser]?.name || currentUser;
            sendPushNotification({
                title: `Neuer Termin: ${userName}`,
                message: `${userName} geht weg: "${title}" am ${wochentag}. Geplante Rückkehr: ${timeHome}`,
                tags: ['clock', 'calendar']
            });
            
            toast.success('Abgemeldet! Viel Spaß! 👋');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {appointmentToEdit ? 'Termin bearbeiten' : 'Abmelden / Termin'}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Sag Bescheid, wo du bist & wann du wieder da bist</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                                Wochentag
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={wochentag}
                                    onChange={(e) => setWochentag(e.target.value as DayOfWeek)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                                >
                                    {DAYS.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                                Was hast du vor? (z.B. Treffen mit Kumpel)
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="z.B. Treffen mit Leon"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                                Wann bist du wieder zuhause?
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="time"
                                    value={timeHome}
                                    onChange={(e) => setTimeHome(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                                Notiz / Details (optional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="z.B. Wir sind am Spielplatz..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none h-24"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <Check size={20} />
                            {appointmentToEdit ? 'Speichern' : 'Termin eintragen'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
