import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DayOfWeek, Task } from '../types';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { generateWeeklyPlan } from '../services/generatorService';
import DayColumn from '../components/DayColumn';
import TaskCard from '../components/TaskCard';
import { Sparkles } from 'lucide-react';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export default function Dashboard() {
    const { tasks, moveTask, setTasks } = useStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const currentUser = useStore(state => state.currentUser);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleGeneratePlan = () => {
        if (window.confirm("Bist du sicher? Der aktuelle Wochenplan wird überschrieben.")) {
            const newPlan = generateWeeklyPlan();
            setTasks(newPlan);
            publishEvent('WEEKLY_PLAN_GENERATED', newPlan); // Publish custom event so others get the whole plan update
            // Also we need to listen for that new event or we could just use setTasks on clients, but a FULL sync payload works better if added to syncService
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // optional logic during drag over
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;

        // Find the task we are moving
        const activeTaskId = active.id as string;
        const activeTaskData = tasks.find(t => t.id === activeTaskId);
        if (!activeTaskData) return;

        // Determine target column (either dropped on a column directly or on another task)
        let newDayStr: string | null = null;
        if (over.data.current?.type === 'Column') {
            newDayStr = over.id as string;
        } else if (over.data.current?.type === 'Task') {
            const overTask = over.data.current.task as Task;
            newDayStr = overTask.wochentag;
        }

        if (newDayStr && DAYS.includes(newDayStr as DayOfWeek)) {
            const targetDay = newDayStr as DayOfWeek;
            if (activeTaskData.wochentag !== targetDay) {
                // Optimistic UI Update locally
                moveTask(activeTaskId, targetDay);
                // Sync to other users
                publishEvent('TASK_UPDATED', { id: activeTaskId, updates: { wochentag: targetDay } });
            }
        }
    };

    const dropAnimationConfig = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    return (
        <div className="h-full flex flex-col relative pt-4 -mx-6 px-6">

            <div className="flex items-center justify-between mb-4 sticky left-0 shrink-0 pr-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight ml-2">Wochenplan</h1>
                    <p className="text-slate-500 font-medium ml-2">Diese Woche zu erledigen</p>
                </div>

                {currentUser === 'Ric' && (
                    <button
                        onClick={handleGeneratePlan}
                        className="flex items-center gap-1.5 bg-indigo-600 active:bg-indigo-700 text-white px-3 py-2 rounded-xl shadow-md text-sm font-bold tracking-wide transition-transform active:scale-95"
                    >
                        <Sparkles size={16} />
                        <span className="hidden md:inline">Generieren</span>
                    </button>
                )}
            </div>

            {/* Horizontal Scroll Area for Days */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex pb-6 px-2 snap-x snap-mandatory hide-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    {DAYS.map((day) => {
                        const dayTasks = tasks.filter((t) => t.wochentag === day);
                        return (
                            <div key={day} className="snap-center shrink-0 h-full">
                                <DayColumn day={day} tasks={dayTasks} />
                            </div>
                        );
                    })}

                    <DragOverlay dropAnimation={dropAnimationConfig}>
                        {activeTask ? <TaskCard task={activeTask} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
