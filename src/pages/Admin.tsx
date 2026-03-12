import { useState } from 'react';
import { ShieldAlert, Database, Smartphone, Bell, Package, TrendingUp } from 'lucide-react';
import TaskDatabase from '../components/TaskDatabase';
import AdminShopView from '../components/AdminShopView';
import AdminPenaltyCard from '../components/AdminPenaltyCard';
import AdminPushMessageCard from '../components/AdminPushMessageCard';
import AdminSystemCard from '../components/AdminSystemCard';
import WeeklyReportModal from '../components/WeeklyReportModal';

type Tab = 'tasks' | 'penalty' | 'message' | 'shop' | 'system' | 'report';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tasks', label: 'Aufgaben', icon: <Database size={18} /> },
    { id: 'penalty', label: 'Sperre', icon: <Smartphone size={18} /> },
    { id: 'message', label: 'Nachricht', icon: <Bell size={18} /> },
    { id: 'shop', label: 'Shop', icon: <Package size={18} /> },
    { id: 'report', label: 'Bericht', icon: <TrendingUp size={18} /> },
    { id: 'system', label: 'System', icon: <ShieldAlert size={18} /> },
];

import React from 'react';

export default function Admin() {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');

    return (
        <div className="flex flex-col bg-slate-50 dark:bg-slate-950 relative pb-20 transition-colors">
            {/* Header - Compact */}
            <div className="bg-slate-900 px-6 pt-4 pb-3 shadow-md text-white">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={20} className="text-red-400" />
                    <h1 className="text-xl font-extrabold tracking-tight">Admin Zentrale</h1>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto uppercase tracking-widest font-bold">Pro</span>
                </div>
            </div>

            {/* Tab Bar - Sticky at Top of Screen (considering Layout padding) */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2 sticky top-[-16px] z-30 flex gap-1 overflow-x-auto hide-scrollbar shadow-sm">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="px-4 py-4 flex-1">
                {activeTab === 'tasks' && <TaskDatabase />}
                {activeTab === 'penalty' && <AdminPenaltyCard />}
                {activeTab === 'message' && <AdminPushMessageCard />}
                {activeTab === 'shop' && <AdminShopView />}
                {activeTab === 'system' && <AdminSystemCard />}
                {activeTab === 'report' && <WeeklyReportModal onClose={() => setActiveTab('tasks')} />}
            </div>
        </div>
    );
}
