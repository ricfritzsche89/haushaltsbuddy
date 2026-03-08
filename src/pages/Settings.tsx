import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const { users, currentUser, setCurrentUser, setDarkMode } = useStore();
    const navigate = useNavigate();

    if (!currentUser) return null;
    const userObj = users[currentUser];

    const handleLogout = () => {
        setCurrentUser(null);
        navigate('/');
    };

    const toggleDarkMode = () => {
        setDarkMode(currentUser, !userObj.darkMode);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-4 transition-colors">
            <div className="bg-white dark:bg-slate-900 px-6 pt-10 pb-4 shadow-sm sticky top-0 z-10 transition-colors">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                    <SettingsIcon size={28} className="text-blue-500" /> Profil & Einstellungen
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
                    <div
                        className="w-24 h-24 mx-auto rounded-full border-4 shadow-sm flex items-center justify-center font-bold text-3xl mb-4"
                        style={{ borderColor: userObj.color, backgroundColor: `${userObj.color}20`, color: userObj.color }}
                    >
                        {userObj.avatarUrl ? (
                            <img src={userObj.avatarUrl} alt={userObj.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            userObj.name.charAt(0)
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{userObj.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Lvl {Math.min(100, Math.floor(Math.sqrt(userObj.xp / 50)) + 1)} • {userObj.xp} XP</p>
                </div>

                {/* Options */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500">
                                {userObj.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            Dunkelmodus (Dark Mode)
                        </div>

                        {/* Toggle Switch UI */}
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${userObj.darkMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                            <motion.div
                                layout
                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                                animate={{ x: userObj.darkMode ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </div>
                    </button>

                    {/* Setup Profile (Placeholder) */}
                    <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-blue-500">
                                <UserIcon size={20} />
                            </div>
                            Avatar ändern (Coming soon)
                        </div>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors font-bold"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                <LogOut size={20} />
                            </div>
                            Profil wechseln (Abmelden)
                        </div>
                    </button>

                </div>

            </div>
        </div>
    );
}
