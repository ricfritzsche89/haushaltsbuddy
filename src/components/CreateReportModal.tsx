import { useState, useRef } from 'react';
import type { UserId, OffenseReport } from '../types';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { Camera, Flag, Trash2, X } from 'lucide-react';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';

export function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const MAX_SIZE = 800;
                if (width > height && width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Lower quality to stay within 1MB Firestore limit comfortably
                resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

function PhotoUpload({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            onChange(compressed);
        } catch {
            toast.error('Fehler beim Komprimieren des Bildes.');
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">{label}</label>

            {value ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <img src={value} alt="Preview" className="w-full h-40 object-cover opacity-90" />
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 shadow-md"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 cursor-pointer transition-colors"
                >
                    <Camera size={24} className="mb-1 opacity-70" />
                    <span className="text-sm font-semibold">Foto hochladen (optional)</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        // @ts-ignore
                        onChange={handle}
                        onClick={e => (e.target as HTMLInputElement).value = ''}
                    />
                </div>
            )}
        </div>
    );
}

export default function CreateReportModal({ onClose }: { onClose: () => void }) {
    const { users, currentUser, addOffenseReport } = useStore();
    const [targetUser, setTargetUser] = useState<UserId>('Tayler' as UserId);
    const [reportReason, setReportReason] = useState('');
    const [reportPhoto, setReportPhoto] = useState<string | null>(null);

    const allUsers = Object.values(users).filter(u => u.role !== 'admin');

    const handleReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportReason.trim() || !currentUser) {
            toast.error('Bitte sag uns, was vorgefallen ist');
            return;
        }

        const newReport: OffenseReport = {
            id: Math.random().toString(36).substr(2, 9),
            reportedBy: currentUser,
            reportedUser: targetUser,
            reason: reportReason.trim(),
            status: 'pending',
            timestamp: Date.now(),
            photoUrl: reportPhoto || undefined,
        };

        addOffenseReport(newReport);
        publishEvent('OFFENSE_REPORT_ADDED', newReport);

        toast.success('Meldung abgeschickt! Ein Admin wird sich das ansehen.');

        // Notify Admins
        sendPushNotification({
            title: '🚨 Neue Meldung eingegangen!',
            message: `${users[currentUser]?.name} hat ${users[targetUser]?.name} gemeldet.`,
            priority: 4,
            tags: ['rotating_light'],
            click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/penalties'
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                        <Flag size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">Jemanden Melden</h2>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Gib Admins Bescheid, was passiert ist</p>
                    </div>
                </div>

                <form onSubmit={handleReport} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Wer hat Mist gebaut?</label>
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-x-auto hide-scrollbar">
                            {allUsers.map(u => (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => setTargetUser(u.id)}
                                    className={`
                                        flex-1 min-w-[100px] flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                                        ${targetUser === u.id ? 'bg-white dark:bg-slate-700 shadow-md transform scale-105' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800 opacity-60 grayscale'}
                                    `}
                                >
                                    <UserAvatar user={u} size={64} />
                                    <span className={`text-xs font-extrabold ${targetUser === u.id ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{u.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Was ist passiert?</label>
                        <textarea value={reportReason} onChange={e => setReportReason(e.target.value)}
                            placeholder="z.B. Geschirr stehen gelassen, Aufgabe verweigert..." rows={3} required
                            className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-shadow resize-none font-semibold"></textarea>
                    </div>

                    <PhotoUpload label="Beweisfoto (optional)" value={reportPhoto} onChange={setReportPhoto} />

                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-lg tracking-wide py-3.5 rounded-2xl transition-all active:scale-[0.98] mt-2 shadow-md">
                        Meldung abschicken
                    </button>
                </form>
            </div>
        </div>
    );
}
