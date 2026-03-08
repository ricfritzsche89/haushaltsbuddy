import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { useStore } from '../store/useStore';
import { CheckCircle2, Navigation, MessageCircle, Link as LinkIcon, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
    task: Task;
}

export default function TaskCard({ task }: Props) {
    const users = useStore(state => state.users);
    const navigate = useNavigate();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const assignedUser = task.zugewiesenerNutzer ? users[task.zugewiesenerNutzer] : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2 relative touch-none
        ${isDragging ? 'opacity-50 ring-2 ring-blue-500 scale-105 z-50' : ''}`}
        >
            {/* Drag handle area (top of card) */}
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
            />

            {/* Content wrapper - high z-index to allow clicking buttons if we had any */}
            <div
                onClick={() => navigate(`/task/${task.id}`)}
                className="relative z-0 flex flex-col gap-2 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors"
            >

                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-800 text-sm leading-tight pr-4">
                        {task.titel}
                    </h3>
                    <div className="flex -mr-1">
                        {task.status === 'verifiziert' && <CheckCircle2 size={16} className="text-green-500" />}
                        {task.status === 'erledigt' && <CheckCircle2 size={16} className="text-blue-500" />}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <Navigation size={10} />
                    {task.raum}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white"
                                style={{ backgroundColor: assignedUser.color }}
                            >
                                {assignedUser.name.charAt(0)}
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
    );
}
