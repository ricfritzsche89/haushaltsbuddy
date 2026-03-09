import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { Camera, Check, ChevronLeft, MessageCircle, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import UserAvatar from '../components/UserAvatar';

export default function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, updateTask, currentUser, addComment, addXP } = useStore();
    const task = tasks.find(t => t.id === id);
    const users = useStore(state => state.users);

    const [commentText, setCommentText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    if (!task || !currentUser) return <div className="p-4 text-slate-700 dark:text-slate-300">Aufgabe nicht gefunden</div>;

    const isAdmin = Boolean(currentUser && users[currentUser]?.role === 'admin');
    const isAssignedUser = task.zugewiesenerNutzer === currentUser;
    const isDone = task.status === 'erledigt' || task.status === 'verifiziert';

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading('Komprimiere Foto...');

        try {
            // Compress & convert to Base64 – stored directly in Firestore (no Firebase Storage needed)
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target?.result as string;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxDimension = 800;

                        if (width > height && width > maxDimension) {
                            height = Math.round(height * maxDimension / width);
                            width = maxDimension;
                        } else if (height > maxDimension) {
                            width = Math.round(width * maxDimension / height);
                            height = maxDimension;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                    img.onerror = reject;
                };
                reader.onerror = reject;
            });

            updateTask(task.id, { beweisFoto: base64 });
            publishEvent('TASK_UPDATED', { id: task.id, updates: { beweisFoto: base64 } });
            toast.success('Foto gespeichert!', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Fehler beim Speichern des Fotos!', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const markAsDone = () => {
        // Zugriffsschutz: nur der zugewiesene User darf abschließen
        if (!isAssignedUser && !isAdmin) {
            toast.error('Nur der zugewiesene User kann diese Aufgabe abschließen!');
            return;
        }
        if (!task.beweisFoto) {
            toast.error('Bitte lade zuerst ein Beweisfoto hoch!');
            return;
        }

        updateTask(task.id, { status: 'erledigt' });
        publishEvent('TASK_UPDATED', { id: task.id, updates: { status: 'erledigt' } });

        if (task.zugewiesenerNutzer) {
            addXP(task.zugewiesenerNutzer, task.xpBelohnung);
            publishEvent('XP_ADDED', { userId: task.zugewiesenerNutzer, amount: task.xpBelohnung });
            toast.success(`+${task.xpBelohnung} XP verdient! 🎉`);
        }

        // Ntfy Push an alle Admins
        sendPushNotification({
            title: `✅ Aufgabe erledigt!`,
            message: `${users[currentUser]?.name} hat "${task.titel}" erledigt. Bitte verifizieren!`,
            priority: 4,
            tags: ['white_check_mark', 'eyes'],
            // Link directly to task
            click: `/#/task/${task.id}`
        });

        navigate(-1);
    };

    // Admin: Aufgabe verifizieren (= Gültig markieren)
    const verifyTask = () => {
        updateTask(task.id, { status: 'verifiziert' });
        publishEvent('TASK_UPDATED', { id: task.id, updates: { status: 'verifiziert' } });
        toast.success('Aufgabe verifiziert! ✅');

        sendPushNotification({
            title: `🌟 Aufgabe bestätigt!`,
            message: `Deine Aufgabe "${task.titel}" wurde von einem Admin bestätigt!`,
            priority: 3,
            tags: ['star', 'white_check_mark']
        });
    };

    // Admin: Aufgabe zurückweisen (= wieder auf offen setzen, Foto löschen)
    const rejectTask = () => {
        updateTask(task.id, { status: 'offen', beweisFoto: undefined });
        publishEvent('TASK_UPDATED', { id: task.id, updates: { status: 'offen', beweisFoto: null } });
        toast('Aufgabe zurückgesetzt. Bitte erneut erledigen.', { icon: '⚠️' });

        sendPushNotification({
            title: `❌ Aufgabe abgelehnt`,
            message: `"${task.titel}" wurde abgelehnt. Bitte nochmal richtig erledigen!`,
            priority: 4,
            tags: ['x', 'warning']
        });
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
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-4 transition-colors">

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 px-4 pt-6 pb-4 flex items-center shadow-sm sticky top-0 z-10 transition-colors border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white ml-2 line-clamp-1 transition-colors">{task.titel}</h1>
                {/* Status Badge */}
                <div className="ml-auto">
                    {task.status === 'verifiziert' && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">✅ Verifiziert</span>}
                    {task.status === 'erledigt' && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">⏳ Ausstehend</span>}
                    {task.status === 'offen' && <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full">Offen</span>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* Detail Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{task.raum}</p>
                            {task.beschreibung && (
                                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                        {task.beschreibung}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-extrabold text-sm border-2 border-orange-200 shrink-0">
                            {task.xpBelohnung} XP
                        </div>
                    </div>

                    {/* Zugewiesener User */}
                    {task.zugewiesenerNutzer && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: users[task.zugewiesenerNutzer]?.color }}>
                                {users[task.zugewiesenerNutzer]?.name.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{users[task.zugewiesenerNutzer]?.name}</span>
                        </div>
                    )}

                    {/* Photo Upload Area */}
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2 transition-colors">
                            <Camera size={16} /> Beweisfoto
                        </h3>

                        {task.beweisFoto ? (
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border-2 border-green-200">
                                <img src={task.beweisFoto} alt="Beweis" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            // Nur der zugewiesene User (oder Admin) kann ein Foto hochladen
                            (isAssignedUser || isAdmin) && !isDone ? (
                                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-500 font-medium active:bg-slate-200 dark:active:bg-slate-600 relative overflow-hidden">
                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <Camera size={32} className="text-slate-400" />
                                        <span>{isUploading ? 'Wird verarbeitet...' : 'Foto aufnehmen / auswählen'}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        onChange={handlePhotoUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            ) : (
                                <div className="flex items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-sm">
                                    Noch kein Beweisfoto
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Admin Verification Actions */}
                {isAdmin && task.status === 'erledigt' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-3xl p-5 border-2 border-yellow-200 dark:border-yellow-800/50 space-y-3">
                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">Admin: Aufgabe überprüfen</p>
                        <div className="flex gap-3">
                            <button
                                onClick={verifyTask}
                                className="flex-1 bg-green-500 active:bg-green-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                            >
                                <Check size={18} /> Bestätigen
                            </button>
                            <button
                                onClick={rejectTask}
                                className="flex-1 bg-red-500 active:bg-red-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                            >
                                <X size={18} /> Ablehnen
                            </button>
                        </div>
                    </div>
                )}

                {/* Admin can reopen a verified task */}
                {isAdmin && task.status === 'verifiziert' && (
                    <button
                        onClick={rejectTask}
                        className="w-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition active:scale-[0.98]"
                    >
                        <X size={16} /> Aufgabe zurücksetzen
                    </button>
                )}

                {/* Comments Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2 px-2 transition-colors">
                        <MessageCircle size={16} /> {task.kommentare.length} Kommentare
                    </h3>

                    <div className="space-y-3 px-2">
                        {task.kommentare.map(c => {
                            const u = users[c.userId];
                            return (
                                <div key={c.id} className="flex gap-3">
                                    <UserAvatar user={u} size={32} className="flex-shrink-0 mt-0.5" />
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex-1 border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                                        <span className="font-bold text-xs text-slate-400 dark:text-slate-500 block mb-0.5">{u?.name}</span>
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
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-colors"
                        />
                        <button type="submit" disabled={!commentText.trim()} className="bg-blue-600 text-white p-3 rounded-full shadow-md active:bg-blue-700 disabled:opacity-50 transition-colors">
                            <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
                        </button>
                    </form>
                </div>

            </div>

            {/* Footer Action: nur für zugewiesenen User, wenn Aufgabe noch offen */}
            {task.status === 'offen' && isAssignedUser && (
                <div className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 sticky bottom-0 transition-colors">
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
