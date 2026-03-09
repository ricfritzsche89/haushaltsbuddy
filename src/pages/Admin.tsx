import { useState } from 'react';
import { ShieldAlert, Database, Smartphone, Bell, Package } from 'lucide-react';
import TaskDatabase from '../components/TaskDatabase';
import AdminShopView from '../components/AdminShopView';
import AdminPenaltyCard from '../components/AdminPenaltyCard';
import AdminPushMessageCard from '../components/AdminPushMessageCard';
import AdminSystemCard from '../components/AdminSystemCard';

type Tab = 'tasks' | 'penalty' | 'message' | 'shop' | 'system';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tasks', label: 'Aufgaben', icon: <Database size={18} /> },
    { id: 'penalty', label: 'Sperre', icon: <Smartphone size={18} /> },
    { id: 'message', label: 'Nachricht', icon: <Bell size={18} /> },
    { id: 'shop', label: 'Shop', icon: <Package size={18} /> },
    { id: 'system', label: 'System', icon: <ShieldAlert size={18} /> },
];

import React from 'react';

export default function Admin() {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-4 overflow-y-auto hide-scrollbar transition-colors">
            {/* Header */}
            <div className="bg-slate-900 px-6 pt-10 pb-4 shadow-md text-white">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={28} className="text-red-400" />
                    <h1 className="text-3xl font-extrabold tracking-tight">Admin Zentrale</h1>
                </div>
                <p className="text-slate-400 font-medium mt-1 pl-10">Familien-Management</p>
            </div>

            {/* Tab Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2 sticky top-0 z-10 flex gap-1 overflow-x-auto hide-scrollbar shadow-sm">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="px-6 py-6 flex-1">
                {activeTab === 'tasks' && <TaskDatabase />}
                {activeTab === 'penalty' && <AdminPenaltyCard />}
                {activeTab === 'message' && <AdminPushMessageCard />}
                {activeTab === 'shop' && <AdminShopView />}
                {activeTab === 'system' && <AdminSystemCard />}
            </div>
        </div>
    );
}
