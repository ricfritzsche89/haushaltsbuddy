import type { Task, DayOfWeek, UserId } from '../types';
import { useStore } from '../store/useStore';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const generateId = () => Math.random().toString(36).substr(2, 9);

export function generateWeeklyPlan() {
    const store = useStore.getState();
    const users = Object.values(store.users);
    const templates = store.taskTemplates;

    const availabilityMultiplier = {
        available: 1.0,
        little_time: 0.5,
        busy: 0.2,
        unavailable: 0
    };

    const newTasks: Task[] = [];
    const eligibleUsers = users.filter(u => u.availability !== 'unavailable');

    // Tracker for random tasks' value sum (schwierigkeitspunkte) per user per day.
    // Fixed assignment tasks are NOT included in this limit.
    const userDailyRandomPoints = {} as Record<UserId, Record<DayOfWeek, number>>;
    users.forEach(u => {
        userDailyRandomPoints[u.id] = { Montag: 0, Dienstag: 0, Mittwoch: 0, Donnerstag: 0, Freitag: 0, Samstag: 0, Sonntag: 0 };
    });

    // Helper: Select random days
    const getRandomDays = (count: number): DayOfWeek[] => {
        const shuffled = [...DAYS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };


    templates.forEach(template => {
        let assignedDays: DayOfWeek[] = [];

        switch (template.frequenz) {
            case 'täglich':
                assignedDays = [...DAYS];
                break;
            case 'alle_3_tage':
                // e.g. Montag, Donnerstag, Sonntag
                assignedDays = ['Montag', 'Donnerstag', 'Sonntag'];
                break;
            case '2x_woche':
                assignedDays = getRandomDays(2);
                break;
            case '1x_woche':
                assignedDays = getRandomDays(1);
                break;
            case '1x_monat':
                // 25% chance to be in THIS week
                if (Math.random() < 0.25) {
                    assignedDays = getRandomDays(1);
                }
                break;
            case 'nach_bedarf':
                // Typically we don't auto-schedule "nach Bedarf", it usually sits in a manual pool or is added ad-hoc
                // But let's schedule it 1x a week as a reminder, or leave it out. We will schedule it 1x randomly.
                assignedDays = getRandomDays(1);
                break;
        }

        assignedDays.forEach(day => {
            const isFixed = !!template.festeZuweisung;

            let assignedUser: string;
            if (isFixed) {
                // Feste Zuweisung: immer zuweisen, ignoriert das 5-Punkte-Limit
                assignedUser = template.festeZuweisung!;
            } else {
                // Zufällig zuweisen, aber nur wenn Wertigkeit-Budget noch vorhanden
                let pool = [...eligibleUsers];
                if (template.erlaubteNutzer && template.erlaubteNutzer.length > 0) {
                    pool = pool.filter(u => template.erlaubteNutzer!.includes(u.id));
                }

                // Filtere User die noch Kapazität haben
                const availablePool = pool.filter(u =>
                    userDailyRandomPoints[u.id][day] + template.schwierigkeitspunkte <= 5
                );

                // Wenn niemand mehr Kapazität hat -> Aufgabe NICHT generieren für diesen Tag
                if (availablePool.length === 0) return;

                // Gewichtung nach Verfügbarkeit
                const shuffled = availablePool.sort(() => Math.random() - 0.5);
                const chosen = shuffled.find(u => Math.random() < availabilityMultiplier[u.availability]);
                assignedUser = chosen ? chosen.id : (shuffled[0]?.id || 'Ric');

                // Punkte für diesen User/Tag addieren
                (userDailyRandomPoints as any)[assignedUser][day] += template.schwierigkeitspunkte;
            }

            newTasks.push({
                id: generateId(),
                titel: template.titel,
                raum: template.raum,
                beschreibung: template.beschreibung,
                xpBelohnung: template.xpBelohnung,
                schwierigkeitspunkte: template.schwierigkeitspunkte,
                zugewiesenerNutzer: assignedUser as UserId,
                wochentag: day,
                status: 'offen',
                kommentare: [],
                erstelltAm: Date.now(),
                festeZuweisung: template.festeZuweisung
            });
        });
    });

    return newTasks;
}
