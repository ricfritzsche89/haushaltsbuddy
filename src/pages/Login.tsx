import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Login() {
    const { users, setCurrentUser, setPin, currentUser } = useStore();
    const navigate = useNavigate();

    // Auto-redirect: bereits eingeloggte User direkt zum Dashboard schicken
    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, navigate]);

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [pinInput, setPinInput] = useState('');
    const [errorString, setErrorString] = useState('');

    const selectedUser = selectedUserId ? users[selectedUserId] : null;

    const handleUserSelect = (id: string) => {
        setSelectedUserId(id);
        setPinInput('');
        setErrorString('');
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        if (pinInput.length < 4) {
            setErrorString('PIN muss mindestens 4 Zahlen lang sein.');
            return;
        }

        if (!selectedUser.pin) {
            // First time setting PIN
            setPin(selectedUser.id, pinInput);
            setCurrentUser(selectedUser.id);
            navigate('/dashboard');
        } else {
            // Login attempt
            if (selectedUser.pin === pinInput) {
                setCurrentUser(selectedUser.id);
                navigate('/dashboard');
            } else {
                setErrorString('Falscher PIN. Bitte versuche es erneut.');
                setPinInput('');
            }
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-slate-50 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {!selectedUserId ? (
                    <motion.div
                        key="profile-selection"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="w-full max-w-sm"
                    >
                        <div className="text-center mb-10">
                            <span className="text-sm font-bold tracking-widest text-blue-500 uppercase">Willkommen im</span>
                            <h1 className="text-4xl font-extrabold text-slate-900 mt-2 mb-2 tracking-tight">Haushaltsbuddy</h1>
                            <p className="text-slate-500">Wer bist du?</p>
                        </div>

                        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">
                            {Object.values(users).map((user) => (
                                <motion.div key={user.id} variants={item}>
                                    <button
                                        onClick={() => handleUserSelect(user.id)}
                                        className="w-full aspect-square bg-white rounded-3xl shadow-sm border-2 border-transparent hover:border-slate-200 transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group active:scale-95"
                                    >
                                        <div
                                            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: `${user.color}15`, color: user.color }}
                                        >
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <span className="font-semibold text-slate-700 text-lg">{user.name}</span>
                                        <div className="absolute bottom-0 w-full h-1.5 opacity-80" style={{ backgroundColor: user.color }} />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="pin-entry"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="w-full max-w-sm flex flex-col items-center bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100"
                    >
                        <button
                            onClick={() => setSelectedUserId(null)}
                            className="self-start text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 font-semibold text-sm active:scale-95 transition-transform"
                        >
                            <ArrowLeft size={18} /> Zurück
                        </button>

                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner mb-6"
                            style={{ backgroundColor: `${selectedUser?.color}15`, color: selectedUser?.color }}
                        >
                            {selectedUser?.avatarUrl ? (
                                <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                selectedUser?.name.charAt(0)
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedUser?.name}</h2>
                        <p className="text-slate-500 text-sm mb-8 text-center">
                            {!selectedUser?.pin ? 'Lege deinen PIN (min. 4 Zahlen) zum Sperren deines Profils fest.' : 'Bitte gib deinen PIN ein, um dich anzumelden.'}
                        </p>

                        <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={8}
                                    value={pinInput}
                                    onChange={(e) => {
                                        setPinInput(e.target.value);
                                        setErrorString('');
                                    }}
                                    autoFocus
                                    placeholder={!selectedUser?.pin ? "Neuer PIN" : "Dein PIN"}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                                />
                            </div>

                            {errorString && (
                                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm font-semibold text-center">
                                    {errorString}
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                disabled={pinInput.length < 4}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {!selectedUser?.pin ? 'PIN speichern & Login' : 'Anmelden'} <ArrowRight size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
