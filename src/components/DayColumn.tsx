import type { DayOfWeek, Task, Appointment } from '../types';
import TaskCard from './TaskCard';
import AppointmentCard from './AppointmentCard';

interface Props {
    day: DayOfWeek;
    tasks: Task[];
    appointments?: Appointment[];
    isActive?: boolean;
    onDayClick?: () => void;
    isCompact?: boolean;
    swapSourceId?: string | null;
    onSwapSelect?: (taskId: string) => void;
    onEditAppointment?: (id: string) => void;
    canEditAppointments?: boolean;
}

export default function DayColumn({ 
    day, 
    tasks, 
    appointments = [], 
    isActive, 
    onDayClick, 
    isCompact, 
    swapSourceId, 
    onSwapSelect,
    onEditAppointment,
    canEditAppointments
}: Props) {
    return (
        <div
            className={`flex flex-col flex-shrink-0 ${isCompact ? 'w-60 md:w-64 lg:w-72 mr-4 max-w-[85vw]' : 'w-full'} h-full rounded-3xl p-4 lg:p-5 transition-colors 
            ${isActive ? 'bg-blue-50/80 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800' : 'bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent'}
            ${swapSourceId ? 'border-indigo-200/50' : ''}`}
        >
            <div
                className="flex justify-between items-center mb-4 px-2 cursor-pointer group"
                onClick={onDayClick}
            >
                <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">{day}</h2>
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-300 bg-white dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 -m-1 space-y-3 pb-20">
                {/* Appointments First */}
                {appointments.map((app) => (
                    <AppointmentCard 
                        key={app.id} 
                        appointment={app} 
                        onEdit={() => onEditAppointment?.(app.id)}
                        canEdit={canEditAppointments}
                    />
                ))}

                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        swapSourceId={swapSourceId}
                        onSwapSelect={onSwapSelect}
                    />
                ))}
                {tasks.length === 0 && appointments.length === 0 && (
                    <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 font-medium text-sm transition-colors">
                        Keine Einträge heute
                    </div>
                )}
            </div>
        </div>
    );
}
