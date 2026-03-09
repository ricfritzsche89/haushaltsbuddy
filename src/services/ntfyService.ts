import { useStore } from '../store/useStore';
import { publishEvent } from './syncService';
import type { UserId } from '../types';

const NTFY_TOPIC = 'haushaltsbuddy_fam_fritzsche_89x';
const NTFY_URL = 'https://ntfy.sh';

export interface NtfyMessage {
    title: string;
    message: string;
    priority?: 1 | 2 | 3 | 4 | 5;
    tags?: string[];
    clickUrl?: string;
    click?: string; // alias for clickUrl
    targetUsers?: UserId[]; // Wenn gesetzt, bekommen nur diese Nutzer die In-App-Notification
}

/**
 * Sendet eine Push-Nachricht an den festgelegten Familien-Kanal auf ntfy.sh
 * und erzeugt parallel dazu In-App Notifications für die Zielnutzer.
 */
export async function sendPushNotification(data: NtfyMessage) {
    try {
        const baseUrl = 'https://ricfritzsche89.github.io/haushaltsbuddy/';
        const clickTarget = data.click || data.clickUrl || '/';
        const fullClickUrl = clickTarget.startsWith('http') ? clickTarget : baseUrl + '#' + clickTarget;

        const store = useStore.getState();
        const users = data.targetUsers || (Object.keys(store.users) as UserId[]);

        // 1. In-App Notifications für alle Zielnutzer erzeugen und direkt in den Zustand laden + syncen
        for (const userId of users) {
            const notif = {
                id: Math.random().toString(36).substr(2, 9),
                userId,
                title: data.title,
                message: data.message,
                timestamp: Date.now(),
                read: false,
                link: clickTarget,
                icon: data.tags?.[0] || 'bell'
            };
            store.addNotification(notif);
            publishEvent('NOTIFICATION_ADDED', { notification: notif });
        }

        // 2. ntfy Push auslösen (Push geht aktuell an alle, da der Topic von allen gehört wird)
        const payload = {
            topic: NTFY_TOPIC,
            message: data.message,
            title: data.title,
            priority: data.priority || 3,
            tags: data.tags || [],
            click: fullClickUrl,
            icon: 'https://ricfritzsche89.github.io/haushaltsbuddy/pwa-192x192.png'
        };

        await fetch(NTFY_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Ntfy Push & In-App Notification gesendet:', data.title);
    } catch (error) {
        console.error('Fehler beim Senden der Push-Nachricht / Notification:', error);
    }
}
