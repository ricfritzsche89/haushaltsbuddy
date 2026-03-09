import { useState, useRef } from 'react';
import type { UserId, Penalty } from '../types';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { AlertTriangle, Camera, Trash2, X } from 'lucide-react';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';

const DURATION_GROUPS = [
    { label: 'Stunden', options: [30, 60, 90, 120, 180, 240, 300, 360, 480, 720] },
    { label: 'Tage', options: [1440, 2880, 4320, 7200] },
    { label: 'Wochen', options: [10080, 20160] },
];

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} Min`;
    if (minutes < 1440) return `${minutes / 60} Std`;
    if (minutes < 10080) return `${minutes / 1440} Tage`;
    return `${minutes / 10080} Wochen`;
}

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
                        onChange={handle}
                        onClick={e => (e.target as HTMLInputElement).value = ''}
                    />
                </div>
            )}
        </div>
    );
}

interface CreatePenaltyModalProps {
    onClose: () => void;
    initialUserId?: UserId;
    initialReason?: string;
    offenseReportIdToApprove?: string;
}

export default function CreatePenaltyModal({ onClose, initialUserId, initialReason, offenseReportIdToApprove }: CreatePenaltyModalProps) {
    const { users, currentUser, addPenalty, updateOffenseReport } = useStore();
    const allUsers = Object.values(users);

    const [targetUser, setTargetUser] = useState<UserId>(initialUserId || ('Tayler' as UserId));
    const [penaltyName, setPenaltyName] = useState(initialReason || '');
    const [duration, setDuration] = useState(60);
    const [photo, setPhoto] = useState<string | null>(null);

    const handleBan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!penaltyName.trim() || !currentUser) {
            toast.error('Bitte Grund angeben');
            return;
        }

        const newPenalty: Penalty = {
            id: Math.random().toString(36).substr(2, 9),
            userId: targetUser,
            reason: penaltyName.trim(),
            durationMinutes: duration,
            issuedBy: currentUser,
            timestamp: Date.now(),
            photoUrl: photo || undefined,
        };

        addPenalty(newPenalty);
        publishEvent('PENALTY_ADDED', newPenalty);

        if (offenseReportIdToApprove) {
            updateOffenseReport(offenseReportIdToApprove, { status: 'confirmed' });
            publishEvent('OFFENSE_REPORT_UPDATED', { reportId: offenseReportIdToApprove, updates: { status: 'confirmed' } });
            toast.success('Meldung bestätigt und Bestrafung verhängt! ⚖️');
        } else {
            toast.success('Ban verhängt! ⚖️');
        }

        const victim = users[targetUser];
        if (victim) {
            sendPushNotification({
                title: '⚖️ BANNED! ⚖️',
                message: `Du wurdest von ${users[currentUser]?.name} bestraft: ${newPenalty.reason} (${formatDuration(duration)})`,
                priority: 5,
                tags: ['warning', 'skull'],
                click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/penalties'
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">Bestrafen</h2>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Verhänge einen Ban (Admin-Only)</p>
                    </div>
                </div>

                <form onSubmit={handleBan} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Wen bestrafen?</label>
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
                                    <UserAvatar name={u.name} color={u.color} size="md" />
                                    <span className={`text-xs font-extrabold ${targetUser === u.id ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{u.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Grund / Name der Strafe</label>
                        <input type="text" value={penaltyName} onChange={e => setPenaltyName(e.target.value)}
                            placeholder="z.B. Handyverbot, PC-Verbot..." required
                            className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50 transition-shadow font-semibold" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Dauer</label>
                        <div className="relative">
                            <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50 appearance-none font-bold">
                                {DURATION_GROUPS.map((group, i) => (
                                    <optgroup key={i} label={group.label}>
                                        {group.options.map(opt => (
                                            <option key={opt} value={opt}>{formatDuration(opt)}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    <PhotoUpload label="Beweisfoto anhängen" value={photo} onChange={setPhoto} />

                    <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-lg tracking-wide py-3.5 rounded-2xl transition-all active:scale-[0.98] shadow-md shadow-rose-200 flex items-center justify-center gap-2 mt-2">
                        <AlertTriangle size={20} />
                        BESTRAFEN
                    </button>
                </form>
            </div>
        </div>
    );
}
