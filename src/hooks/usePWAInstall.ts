import { useState, useEffect } from 'react';

// Global state outside React to persist across remounts and share across components
let deferredPrompt: any = null;
const listeners = new Set<() => void>();

const updateListeners = () => listeners.forEach(l => l());

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    updateListeners();
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateListeners();
});

export function usePWAInstall() {
    const [prompt, setPrompt] = useState<any>(deferredPrompt);

    useEffect(() => {
        // Run immediately in case it changed before mount
        setPrompt(deferredPrompt);

        const listener = () => setPrompt(deferredPrompt);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return false;

        // Show the native PWA install prompt
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, throwing it away
        deferredPrompt = null;
        updateListeners();
        return outcome === 'accepted';
    };

    return {
        canInstall: !!prompt,
        promptInstall
    };
}
