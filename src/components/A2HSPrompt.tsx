import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function A2HSPrompt() {
    const { canInstall, promptInstall } = usePWAInstall();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasDismissed = localStorage.getItem('a2hs_dismissed');
        if (canInstall && !hasDismissed) {
            setIsVisible(true);
        } else if (!canInstall) {
            setIsVisible(false);
        }
    }, [canInstall]);

    const handleInstallClick = async () => {
        setIsVisible(false);
        await promptInstall();
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('a2hs_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-24 left-4 right-4 z-[60] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors md:left-auto md:right-8 md:bottom-8 md:w-96"
                >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-500">
                        <Download size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">App installieren</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Installiere Haushaltsbuddy für das volle Erlebnis direkt auf deinem Homescreen.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            Laden
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
