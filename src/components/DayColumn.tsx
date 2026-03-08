import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DayOfWeek, Task } from '../types';
import TaskCard from './TaskCard';

interface Props {
    day: DayOfWeek;
    tasks: Task[];
    isActive?: boolean;
}

export default function DayColumn({ day, tasks, isActive }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: day,
        data: {
            type: 'Column',
            day,
        },
    });

    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col flex-shrink-0 w-72 md:w-80 max-w-[85vw] h-full rounded-3xl p-4 mr-4 transition-colors 
        ${isOver || isActive ? 'bg-blue-50/80 border-2 border-blue-200 shadow-inner' : 'bg-slate-100/50 border-2 border-transparent'}`}
        >
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">{day}</h2>
                <span className="text-sm font-semibold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 -m-1 space-y-3 pb-20">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                    {tasks.length === 0 && !isOver && (
                        <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium text-sm">
                            Keine Aufgaben heute
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
