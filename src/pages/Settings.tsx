import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut, Moon, Sun, Camera, Palette, Lock, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { publishEvent } from '../services/syncService';
import { motion } from 'framer-motion';
import { ALLE_TITEL } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import AvatarCropModal from '../components/AvatarCropModal';
import TitleSelection from '../components/TitleSelection';

export default function Settings() {
    const { users, currentUser, setCurrentUser, setDarkMode, updateUserProfile, setPin } = useStore();
    const navigate = useNavigate();
    const [showPinChange, setShowPinChange] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newPin2, setNewPin2] = useState('');
    const { canInstall, promptInstall } = usePWAInstall();

    const [cropSrc, setCropSrc] = useState<string | null>(null);

    const COLORS = [
        '#3b82f6', '#ec4899', '#10b981', '#a855f7',
        '#f59e0b', '#ef4444', '#14b8a6', '#6366f1',
        '#f97316', '#06b6d4', '#84cc16', '#8b5cf6',
    ];

    if (!currentUser) return null;
    const userObj = users[currentUser];
    const activeTitel = ALLE_TITEL.find(t => t.id === userObj.activeTitle);

    const handleLogout = () => { setCurrentUser(null); navigate('/'); };
    const toggleDarkMode = () => setDarkMode(currentUser, !userObj.darkMode);

    // --- Avatar Upload + Crop ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            setCropSrc(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // --- PIN Change ---
    const handlePinChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (userObj.pin && userObj.pin !== oldPin) { toast.error('Alter PIN falsch!'); return; }
        if (newPin.length < 4) { toast.error('Neuer PIN muss mind. 4 Stellen haben!'); return; }
        if (newPin !== newPin2) { toast.error('PINs stimmen nicht überein!'); return; }
        setPin(currentUser, newPin);
        toast.success('PIN geändert! 🔐');
        setShowPinChange(false);
        setOldPin(''); setNewPin(''); setNewPin2('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-4 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 px-6 pt-10 pb-4 shadow-sm sticky top-0 z-10 transition-colors border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                    <SettingsIcon size={28} className="text-blue-500" /> Profil &amp; Einstellungen
                </h1>
            </div>

            {/* Crop Modal */}
            {cropSrc && <AvatarCropModal cropSrc={cropSrc} onClose={() => setCropSrc(null)} />}

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
                    <div className="w-24 h-24 mx-auto rounded-full border-4 shadow-sm overflow-hidden flex items-center justify-center font-bold text-3xl mb-3"
                        style={{ borderColor: userObj.color, backgroundColor: `${userObj.color}20`, color: userObj.color }}
                    >
                        {userObj.avatarUrl
                            ? <img src={userObj.avatarUrl} alt={userObj.name} className="w-full h-full object-cover" />
                            : userObj.name.charAt(0)
                        }
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{userObj.name}</h2>
                    {activeTitel && (
                        <p className="text-sm font-bold mt-1" style={{ color: userObj.color }}>
                            {activeTitel.emoji} {activeTitel.name}
                        </p>
                    )}
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">
                        Lvl {Math.min(100, Math.floor(Math.sqrt(userObj.xp / 50)) + 1)} • {userObj.xp} XP
                    </p>
                </div>

                {/* Options */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">

                    {/* Dark Mode */}
                    <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500">
                                {userObj.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            Dunkelmodus
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${userObj.darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                            <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: userObj.darkMode ? 24 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                        </div>
                    </button>

                    {/* Avatar Upload */}
                    <label className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 cursor-pointer">
                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-blue-500">
                                <Camera size={20} />
                            </div>
                            Profilbild ändern
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Tippen →</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>

                    {/* Color Theme */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold mb-4">
                            <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/50 flex items-center justify-center text-pink-500">
                                <Palette size={20} />
                            </div>
                            Profilfarbe
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button key={c} onClick={() => { updateUserProfile(currentUser, { color: c }); publishEvent('USER_PROFILE_UPDATED', { userId: currentUser, updates: { color: c } }); }}
                                    className={`w-9 h-9 rounded-full shadow-sm transition-transform active:scale-95 flex items-center justify-center ${userObj.color === c ? 'ring-4 ring-offset-2 ring-slate-200 dark:ring-slate-700 scale-110' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}>
                                    {userObj.color === c && <Check size={14} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PIN Change */}
                    <div className="border-b border-slate-100 dark:border-slate-800">
                        <button onClick={() => setShowPinChange(!showPinChange)} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
                                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/50 flex items-center justify-center text-orange-500">
                                    <Lock size={20} />
                                </div>
                                PIN ändern
                            </div>
                            <span className="text-slate-400 text-sm">{showPinChange ? '▲' : '▼'}</span>
                        </button>
                        {showPinChange && (
                            <form onSubmit={handlePinChange} className="px-5 pb-5 space-y-3">
                                {userObj.pin && (
                                    <input type="password" inputMode="numeric" maxLength={8} value={oldPin} onChange={e => setOldPin(e.target.value)}
                                        placeholder="Alter PIN" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                                )}
                                <input type="password" inputMode="numeric" maxLength={8} value={newPin} onChange={e => setNewPin(e.target.value)}
                                    placeholder="Neuer PIN (mind. 4 Stellen)" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                                <input type="password" inputMode="numeric" maxLength={8} value={newPin2} onChange={e => setNewPin2(e.target.value)}
                                    placeholder="PIN wiederholen" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                                <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl active:scale-[0.98] transition">PIN speichern</button>
                            </form>
                        )}
                    </div>

                    {/* PWA Install */}
                    {canInstall && (
                        <button onClick={promptInstall} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-blue-500">
                                    <Download size={20} />
                                </div>
                                App auf Homescreen (Installieren)
                            </div>
                            <span className="text-slate-400 text-sm font-medium">Tippen →</span>
                        </button>
                    )}

                    {/* Logout */}
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-bold transition-colors">
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                            <LogOut size={20} />
                        </div>
                        Abmelden
                    </button>
                </div>

                {/* Titel-Auswahl */}
                <TitleSelection />
            </div>
        </div>
    );
}
