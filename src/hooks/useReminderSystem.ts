import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { sendPushNotification } from '../services/ntfyService';
import { publishEvent } from '../services/syncService';
import type { UserId } from '../types';

const DAYS_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export function useReminderSystem() {
    const { tasks, users, lastReminders, markReminderSent } = useStore();
    const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const checkReminders = async () => {
        const now = new Date();
        const hour = now.getHours();
        const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const reminderKey = `${dateKey}-${hour}`;

        // Wir prüfen nur volle Stunden: 6, 14, 17
        if (![6, 14, 17].includes(hour)) return;

        // Schon gesendet?
        if (lastReminders[reminderKey]) return;

        // Logik für die verschiedenen Zeiten
        if (hour === 6) {
            // Morgendliche Zusammenfassung
            const dayName = DAYS_DE[now.getDay()];
            const userSummaries = Object.values(users).map(user => {
                const count = tasks.filter(t =>
                    t.zugewiesenerNutzer === user.id &&
                    t.wochentag === dayName &&
                    t.status === 'offen'
                ).length;
                return { name: user.name, count };
            }).filter(s => s.count > 0);

            if (userSummaries.length > 0) {
                // Wir senden für jeden User eine personalisierte Nachricht (alle auf denselben ntfy Kanal)
                for (const s of userSummaries) {
                    await sendPushNotification({
                        title: `☀️ Guten Morgen, ${s.name}!`,
                        message: `Es stehen heute ${s.count} Aufgaben für dich an. Auf geht's! 🚀`,
                        priority: 5,
                        tags: ['sunny', 'task'],
                        click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/dashboard'
                    });
                }
            } else {
                // Keiner hat Aufgaben? (Unwahrscheinlich, aber möglich)
                await sendPushNotification({
                    title: `☀️ Guten Morgen!`,
                    message: `Heute stehen keine Aufgaben für die Familie an. Genießt den Tag! ☕`,
                    priority: 4,
                    tags: ['coffee'],
                    click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/dashboard'
                });
            }
        }
        else if (hour === 14) {
            await sendPushNotification({
                title: `⚡ Motivations-Kick!`,
                message: `Viel Spaß beim Aufgaben erledigen! Wer zuerst fertig ist, gewinnt… vielleicht? 😉`,
                priority: 5,
                tags: ['muscle', 'rocket'],
                click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/dashboard'
            });
        }
        else if (hour === 17) {
            const openTasks = tasks.filter(t => t.wochentag === DAYS_DE[now.getDay()] && t.status === 'offen').length;
            await sendPushNotification({
                title: `🔍 Status-Check`,
                message: openTasks > 0
                    ? `Alles erledigt? Es sind noch ${openTasks} Aufgaben für heute offen! 📝`
                    : `Super Job! Alle Aufgaben für heute wurden erledigt! 🎉`,
                priority: 5,
                tags: ['checkered_flag'],
                click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/dashboard'
            });
        }

        // Als gesendet markieren (lokal + sync)
        markReminderSent(reminderKey);
        publishEvent('REMINDER_SENT', { reminderKey });
    };

    useEffect(() => {
        // Sofort prüfen beim Start
        checkReminders();

        // Alle 5 Minuten prüfen
        checkInterval.current = setInterval(checkReminders, 5 * 60 * 1000);

        return () => {
            if (checkInterval.current) clearInterval(checkInterval.current);
        };
    }, [tasks, users, lastReminders]);
}
