import { useState, useRef } from 'react';
import type { Task } from '../types';
import { useStore } from '../store/useStore';
import { CheckCircle2, Navigation, MessageCircle, Lock, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Props {
    task: Task;
    /** Task currently selected for swapping (from parent state) */
    swapSourceId?: string | null;
    onSwapSelect?: (taskId: string) => void;
}

export default function TaskCard({ task, swapSourceId, onSwapSelect }: Props) {
    const { users, currentUser } = useStore();
    const navigate = useNavigate();
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [pressing, setPressing] = useState(false);

    const assignedUser = task.zugewiesenerNutzer ? users[task.zugewiesenerNutzer] : null;
    const isDone = task.status === 'erledigt' || task.status === 'verifiziert';
    const isVerified = task.status === 'verifiziert';
    const isOwnTask = task.zugewiesenerNutzer === currentUser;
    const isAdmin = Boolean(currentUser && users[currentUser]?.role === 'admin');
    const isSwapSource = swapSourceId === task.id;
    const isSwapTarget = !!swapSourceId && swapSourceId !== task.id && isOwnTask;

    // Long-press handlers (500ms)
    const startPress = () => {
        if (!isOwnTask || isDone) return;
        setPressing(true);
        longPressTimer.current = setTimeout(() => {
            setPressing(false);
            onSwapSelect?.(task.id);
        }, 500);
    };

    const cancelPress = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setPressing(false);
    };

    const handleCardClick = () => {
        // If we're in swap mode, handle swap selection
        if (swapSourceId) {
            if (swapSourceId === task.id) {
                // Deselect
                onSwapSelect?.('');
                return;
            }
            if (isSwapTarget) {
                onSwapSelect?.(task.id);
            } else {
                toast.error('Du kannst nur deine eigenen Aufgaben tauschen!');
            }
            return;
        }

        // Normal click: open task detail
        if (isOwnTask || isAdmin) {
            navigate(`/task/${task.id}`);
        } else {
            import('react-hot-toast').then(m => m.default.error('Du kannst nur deine eigenen Aufgaben öffnen.'));
        }
    };

    let cardBg = 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800';
    if (isVerified) cardBg = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50';
    else if (isDone) cardBg = 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50';
    if (isSwapSource) cardBg = 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400';
    if (isSwapTarget && swapSourceId) cardBg = 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600 ring-2 ring-amber-400';

    return (
        <div
            onClick={handleCardClick}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onTouchCancel={cancelPress}
            className={`${cardBg} p-3 rounded-2xl shadow-sm border flex flex-col gap-2 relative transition-all cursor-pointer select-none
                ${pressing ? 'scale-95 opacity-70' : 'hover:scale-[1.02]'}
                ${isSwapSource ? 'scale-[1.03]' : ''}
            `}
        >

            {/* Done Overlay Banner */}
            {isDone && (
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none`}>
                    <div className={`${isVerified ? 'bg-green-500' : 'bg-blue-500'} text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full absolute top-2 right-2 uppercase tracking-widest flex items-center gap-1`}>
                        <CheckCircle2 size={9} />
                        {isVerified ? 'Bestätigt' : 'Erledigt'}
                    </div>
                </div>
            )}

            {/* Swap mode indicator */}
            {isSwapSource && (
                <div className="absolute top-2 left-2 bg-indigo-500 text-white rounded-full p-0.5 z-20">
                    <ArrowLeftRight size={10} />
                </div>
            )}

            {/* Content wrapper */}
            <div className={`flex flex-col gap-2 ${isDone ? 'mt-3' : ''}`}>
                <div className="flex justify-between items-start">
                    <h3 className={`font-semibold text-sm leading-tight pr-4 transition-colors
                        ${isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-white'
                        }`}>
                        {task.titel}
                    </h3>
                </div>

                {/* Done visual effect: dimmed content */}
                <div className={isDone ? 'opacity-50' : ''}>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <Navigation size={10} />
                        {task.raum}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                ${isDone ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-orange-100 text-orange-700'}`}>
                                {task.xpBelohnung} XP
                            </span>
                            {task.festeZuweisung && (
                                <Lock size={12} className="text-slate-400" />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {task.kommentare.length > 0 && (
                                <div className="flex items-center gap-0.5 text-slate-400 text-xs font-semibold">
                                    <MessageCircle size={12} />
                                    {task.kommentare.length}
                                </div>
                            )}

                            {assignedUser ? (
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-slate-800"
                                    style={{ backgroundColor: isDone ? '#94a3b8' : assignedUser.color }}
                                >
                                    {isDone ? '✓' : assignedUser.name.charAt(0)}
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 border-dashed flex items-center justify-center text-slate-400 text-xs">
                                    ?
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
