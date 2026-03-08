import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase/config';
import { Camera, Check, ChevronLeft, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, updateTask, currentUser, addComment, addXP } = useStore();
    const task = tasks.find(t => t.id === id);
    const users = useStore(state => state.users);

    const [commentText, setCommentText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    if (!task || !currentUser) return <div className="p-4">Aufgabe nicht gefunden</div>;

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading('Lade Foto hoch...');

        try {
            const storageRef = ref(storage, `tasks/${task.id}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            updateTask(task.id, { beweisFoto: url });
            publishEvent('TASK_UPDATED', { id: task.id, updates: { beweisFoto: url } });

            toast.success('Foto hochgeladen!', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Fehler beim Upload. Sicherstellen dass Firebase Config existiert.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const markAsDone = () => {
        if (!task.beweisFoto) {
            toast.error('Bitte lade zuerst ein Beweisfoto hoch!');
            return;
        }

        // Update status
        updateTask(task.id, { status: 'erledigt' });
        publishEvent('TASK_UPDATED', { id: task.id, updates: { status: 'erledigt' } });

        // Give XP to assigned user
        if (task.zugewiesenerNutzer) {
            addXP(task.zugewiesenerNutzer, task.xpBelohnung);
            publishEvent('XP_ADDED', { userId: task.zugewiesenerNutzer, amount: task.xpBelohnung });
            toast.success(`+${task.xpBelohnung} XP verdient! 🎉`);
        }

        // TODO: Send FCM Push Notification
        publishEvent('NOTIFICATION_SEND', {
            title: 'Aufgabe erledigt',
            body: `${users[currentUser].name} hat "${task.titel}" erledigt!`
        });

        navigate('/dashboard');
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser,
            text: commentText.trim(),
            timestamp: Date.now()
        };

        addComment(task.id, newComment);
        publishEvent('TASK_UPDATED', { id: task.id, updates: { kommentare: [...task.kommentare, newComment] } });
        setCommentText('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-4">

            {/* Header */}
            <div className="bg-white px-4 pt-6 pb-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 active:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 ml-2 line-clamp-1">{task.titel}</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                {/* Detail Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{task.raum}</p>
                            <p className="text-sm text-slate-600 mt-1">{task.beschreibung || 'Keine weitere Beschreibung'}</p>
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-extrabold text-sm border-2 border-orange-200">
                            {task.xpBelohnung} XP
                        </div>
                    </div>

                    {/* Photo Upload Area */}
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Camera size={16} /> Beweisfoto
                        </h3>

                        {task.beweisFoto ? (
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border-2 border-slate-200">
                                <img src={task.beweisFoto} alt="Beweis" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 font-medium active:bg-slate-200 relative overflow-hidden">
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <Camera size={32} className="text-slate-400" />
                                    <span>Foto aufnehmen / auswählen</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    onChange={handlePhotoUpload}
                                    disabled={isUploading || task.status === 'erledigt'}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 px-2">
                        <MessageCircle size={16} /> {task.kommentare.length} Kommentare
                    </h3>

                    <div className="space-y-3 px-2">
                        {task.kommentare.map(c => {
                            const u = users[c.userId];
                            return (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: u?.color }}>
                                        {u?.name.charAt(0)}
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex-1 border border-slate-100 text-sm text-slate-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                        <span className="font-bold text-xs text-slate-400 block mb-0.5">{u?.name}</span>
                                        {c.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-2 mt-4 px-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Schreibe einen Kommentar..."
                            className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                        />
                        <button type="submit" disabled={!commentText.trim()} className="bg-blue-600 text-white p-3 rounded-full shadow-md active:bg-blue-700 disabled:opacity-50 transition-colors">
                            <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
                        </button>
                    </form>
                </div>

            </div>

            {/* Footer Action */}
            {task.status !== 'erledigt' && task.status !== 'verifiziert' && (
                <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-t border-slate-100 sticky bottom-0">
                    <button
                        onClick={markAsDone}
                        className="w-full bg-green-500 active:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_-10px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 text-lg transition-transform active:scale-[0.98]"
                    >
                        <Check size={24} />
                        Aufgabe abschließen
                    </button>
                </div>
            )}
        </div>
    );
}
