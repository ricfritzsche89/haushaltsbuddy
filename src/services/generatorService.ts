import { Task, DayOfWeek, UserId } from '../types';
import { useStore } from '../store/useStore';

const DAYS: DayOfWeek[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const TASK_TEMPLATES = [
    { titel: 'Katze Lucky füttern', raum: 'Küche', beschreibung: '', xp: 10, festeZuweisung: 'Ric' as UserId, diff: 1 },
    { titel: 'Bettwäsche wechseln', raum: 'Schlafzimmer', beschreibung: '', xp: 30, festeZuweisung: 'Nadine' as UserId, diff: 2 },
    { titel: 'Geschirrspüler einräumen', raum: 'Küche', beschreibung: '', xp: 20, diff: 2 },
    { titel: 'Geschirrspüler ausräumen', raum: 'Küche', beschreibung: '', xp: 20, diff: 2 },
    { titel: 'Müll rausbringen', raum: 'Draußen', beschreibung: '', xp: 15, diff: 1 },
    { titel: 'Staubsaugen', raum: 'Wohnzimmer', beschreibung: '', xp: 40, diff: 3 },
    { titel: 'Badezimmer putzen', raum: 'Bad', beschreibung: '', xp: 50, diff: 4 },
    { titel: 'Tisch decken', raum: 'Esszimmer', beschreibung: '', xp: 10, diff: 1 },
    { titel: 'Tisch abräumen', raum: 'Esszimmer', beschreibung: '', xp: 10, diff: 1 },
    { titel: 'Wäsche aufhängen', raum: 'Waschküche', beschreibung: '', xp: 25, diff: 2 },
    { titel: 'Wäsche zusammenlegen', raum: 'Schlafzimmer', beschreibung: '', xp: 25, diff: 2 },
];

export function generateWeeklyPlan() {
    const store = useStore.getState();
    const users = Object.values(store.users);

    // Sort users by availability to give fewer tasks to busy ones
    // available = 1.0 multiplier, little_time = 0.5, busy = 0.2, unavailable = 0
    const availabilityMultiplier = {
        available: 1.0,
        little_time: 0.5,
        busy: 0.2,
        unavailable: 0
    };

    const newTasks: Task[] = [];

    // 1. Assign fixed tasks first
    TASK_TEMPLATES.filter(t => t.festeZuweisung).forEach(template => {
        DAYS.forEach(day => {
            // Katze füttern e.g. every day
            newTasks.push({
                id: Math.random().toString(36).substr(2, 9),
                titel: template.titel,
                raum: template.raum,
                beschreibung: template.beschreibung,
                xpBelohnung: template.xp,
                schwierigkeitspunkte: template.diff,
                zugewiesenerNutzer: template.festeZuweisung,
                wochentag: day,
                status: 'offen',
                kommentare: [],
                erstelltAm: Date.now(),
                festeZuweisung: template.festeZuweisung
            });
        });
    });

    // 2. Distribute flexible tasks across the week fairly
    const flexibleTemplates = TASK_TEMPLATES.filter(t => !t.festeZuweisung);
    const eligibleUsers = users.filter(u => u.availability !== 'unavailable');

    // We want to distribute ~3-5 flexible tasks per day total
    DAYS.forEach(day => {
        // Shuffle users to randomize who gets picked first
        const shuffledUsers = [...eligibleUsers].sort(() => Math.random() - 0.5);
        let dayTasksToAssign = 4; // Arbitrary number per day

        // Pick random templates
        const dailyTemplates = [...flexibleTemplates].sort(() => Math.random() - 0.5).slice(0, dayTasksToAssign);

        dailyTemplates.forEach(template => {
            // Find user with least assigned difficulty so far today/week (simple version: random among eligible, weighted)
            // We'll just distribute round-robin among active ones based on availability check
            let chosenUser = shuffledUsers.find(u => Math.random() < availabilityMultiplier[u.availability]);
            if (!chosenUser) chosenUser = shuffledUsers[0]; // fallback

            if (chosenUser) {
                newTasks.push({
                    id: Math.random().toString(36).substr(2, 9),
                    titel: template.titel,
                    raum: template.raum,
                    beschreibung: template.beschreibung,
                    xpBelohnung: template.xp,
                    schwierigkeitspunkte: template.diff,
                    zugewiesenerNutzer: chosenUser.id,
                    wochentag: day,
                    status: 'offen',
                    kommentare: [],
                    erstelltAm: Date.now()
                });
            }
        });
    });

    return newTasks;
}
