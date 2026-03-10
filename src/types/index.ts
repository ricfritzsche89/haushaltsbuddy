export type UserId = 'Ric' | 'Nadine' | 'Tayler' | 'Fee';

export type UserAvailability = 'available' | 'busy' | 'little_time' | 'unavailable';
export type DashboardViewMode = 'week' | 'today';

export interface UserProfile {
  id: UserId;
  name: string;
  role: 'admin' | 'user';
  color: string;
  avatarUrl?: string;
  pin?: string;
  darkMode?: boolean;
  dashboardView?: DashboardViewMode;
  dashboardFilter?: string;
  availability: UserAvailability;
  xp: number;
  activeTitle?: string;
  unlockedTitles?: string[];
  balance: number;
}

// --- Titel-System ---
export interface TitelDefinition {
  id: string;
  name: string;
  beschreibung: string;
  xpRequired: number; // 0 = Starttitel
  emoji: string;
  nurFuerUser?: string; // UserId - wenn gesetzt, nur für diesen User sichtbar
}

export const ALLE_TITEL: TitelDefinition[] = [
  // Starttitel - exklusiv für den jeweiligen User
  { id: 'chef', name: 'Chef', beschreibung: 'Der Boss des Hauses', xpRequired: 0, emoji: '👑', nurFuerUser: 'Ric' },
  { id: 'chefin', name: 'Chefin', beschreibung: 'Die Chefin des Hauses', xpRequired: 0, emoji: '👑', nurFuerUser: 'Nadine' },
  { id: 'lauch', name: 'Lauch', beschreibung: 'Der Lauch in der Familie', xpRequired: 0, emoji: '🌿', nurFuerUser: 'Tayler' },
  { id: 'igelschnautzchen', name: 'Igelschnäutzchen', beschreibung: 'Niedlich aber stachelig', xpRequired: 0, emoji: '🦔', nurFuerUser: 'Fee' },
  // Freischaltbare Titel
  { id: 'frischling', name: 'Frischling', beschreibung: 'Gerade mit dem Putzen angefangen', xpRequired: 10, emoji: '🐣' },
  { id: 'schuessel_traeger', name: 'Schüssel-Träger', beschreibung: 'Bringt immer brav das Geschirr weg', xpRequired: 30, emoji: '🍽️' },
  { id: 'staubfussel_jaeger', name: 'Staubfussel-Jäger', beschreibung: 'Kein Staubfussel entkommt', xpRequired: 60, emoji: '🔍' },
  { id: 'wischmopp_padawan', name: 'Wischmopp-Padawan', beschreibung: 'Die Macht des Mopps erwacht', xpRequired: 100, emoji: '🧹' },
  { id: 'aufraeum_azubi', name: 'Aufräum-Azubi', beschreibung: 'Lehrjahre sind keine Herrenjahre', xpRequired: 150, emoji: '📚' },
  { id: 'spueli_terminator', name: 'Spüli-Terminator', beschreibung: 'Vernichtet Fettflecken ohne Gnade', xpRequired: 200, emoji: '💪' },
  { id: 'socken_sortierer', name: 'Socken-Sortierer', beschreibung: 'Jede Socke findet ihr Paar', xpRequired: 250, emoji: '🧦' },
  { id: 'buegel_berserker', name: 'Bügel-Berserker', beschreibung: 'Geht mit dem Bügeleisen in den Krieg', xpRequired: 300, emoji: '⚔️' },
  { id: 'muelltonne_meister', name: 'Mülltonnen-Meister', beschreibung: 'Kennt jeden Mülltermin auswendig', xpRequired: 350, emoji: '🗑️' },
  { id: 'kuechen_magier', name: 'Küchen-Magier', beschreibung: 'Macht aus Chaos eine saubere Küche', xpRequired: 400, emoji: '🪄' },
  { id: 'staubsauger_samurai', name: 'Staubsauger-Samurai', beschreibung: 'Ehre, Pflicht und Saugkraft', xpRequired: 450, emoji: '⚡' },
  { id: 'putzteufel', name: 'Putzteufel', beschreibung: 'Besessen vom sauberen Haushalt', xpRequired: 500, emoji: '😈' },
  { id: 'ordnungs_olympionike', name: 'Ordnungs-Olympionike', beschreibung: 'Gold in der Haushaltsdisziplin', xpRequired: 600, emoji: '🏅' },
  { id: 'reinlichkeits_rebell', name: 'Reinlichkeits-Rebell', beschreibung: 'Dreck hat keine Chance', xpRequired: 700, emoji: '🤘' },
  { id: 'aufraeum_artiste', name: 'Aufräum-Artiste', beschreibung: 'Ordnung ist eine Kunstform', xpRequired: 800, emoji: '🎨' },
  { id: 'haus_held', name: 'Haus-Held', beschreibung: 'Rettet täglich die Wohnung', xpRequired: 900, emoji: '🦸' },
  { id: 'sauberkeits_sensei', name: 'Sauberkeits-Sensei', beschreibung: 'Gibt sein Wissen über Reinlichkeit weiter', xpRequired: 1000, emoji: '🧘' },
  { id: 'hygiene_highlander', name: 'Hygiene-Highlander', beschreibung: 'Es kann nur einen geben', xpRequired: 1200, emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'staubkorn_vernichter', name: 'Staubkorn-Vernichter', beschreibung: 'Vernichtet Staub auf Quantenebene', xpRequired: 1400, emoji: '💥' },
  { id: 'putz_prophet', name: 'Putz-Prophet', beschreibung: 'Sieht den Schmutz bereits bevor er kommt', xpRequired: 1600, emoji: '🔮' },
  { id: 'grossmeister_ordnung', name: 'Großmeister der Ordnung', beschreibung: 'Weiser Hüter aller Schubladen', xpRequired: 2000, emoji: '🧙' },
  { id: 'haushaltskoenig', name: 'Haushaltskönig', beschreibung: 'Herrscher über alle Wohnbereiche', xpRequired: 2500, emoji: '👑' },
  { id: 'haushaltskoenigin', name: 'Haushaltskönigin', beschreibung: 'Herrscherin über alle Wohnbereiche', xpRequired: 2500, emoji: '👑' },
  { id: 'putz_gott', name: 'Putz-Gott', beschreibung: 'Jenseits menschlicher Reinlichkeit', xpRequired: 3000, emoji: '✨' },
  { id: 'legende', name: 'Legenden-Status', beschreibung: 'Eine Haushaltlegende für die Ewigkeit', xpRequired: 4000, emoji: '🌟' },
];

export type TaskStatus = 'offen' | 'erledigt' | 'verifiziert';
export type TaskFrequency = 'täglich' | 'alle_3_tage' | '2x_woche' | '1x_woche' | '1x_monat' | 'nach_bedarf';

export interface TaskTemplate {
  id: string;
  titel: string;
  raum: string;
  beschreibung: string;
  schwierigkeitspunkte: number;
  xpBelohnung: number;
  frequenz: TaskFrequency;
  festeZuweisung?: UserId | null;
  erlaubteNutzer?: UserId[];
}

export interface Comment {
  id: string;
  userId: UserId;
  text: string;
  timestamp: number;
}

export type DayOfWeek = 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag' | 'Sonntag';

export interface Task {
  id: string;
  titel: string;
  raum: string;
  beschreibung: string;
  schwierigkeitspunkte: number;
  xpBelohnung: number;
  zugewiesenerNutzer?: UserId | null;
  wochentag: DayOfWeek;
  status: TaskStatus;
  beweisFoto?: string | null;
  kommentare: Comment[];
  erstelltAm: number;
  festeZuweisung?: UserId | null;
}

export interface Reward {
  id: string;
  level: number;
  description: string;
  createdAt: number;
}

export interface WallPost {
  id: string;
  userId: UserId;
  text: string;
  photoUrl?: string;
  likes: UserId[];
  reactions?: Record<string, UserId[]>; // Emoji -> Array of UserIds
  comments: Comment[];
  timestamp: number;
}

export interface Penalty {
  id: string;
  userId: UserId;
  reason: string;
  photoUrl?: string;
  durationMinutes: number;
  timestamp: number;
  activatedAt?: number; // wann der Timer tatsächlich gestartet wurde
  issuedBy?: UserId; // wer hat das Verbot verhängt
}

export interface OffenseReport {
  id: string;
  reportedBy: UserId;     // wer meldet
  reportedUser: UserId;   // wer wird gemeldet
  reason: string;
  photoUrl?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
}

export interface RewardPurchase {
  id: string;
  userId: UserId;
  itemId: string;
  timestamp: number;
  status: 'pending' | 'redeemed';
}

export interface InAppNotification {
  id: string;
  userId: UserId; // who receives the notification
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string; // e.g. '/wall', '/dashboard'
  icon?: string; // emoji or identifier
}
export interface Appointment {
  id: string;
  userId: UserId;
  title: string;
  timeHome: string;
  wochentag: DayOfWeek;
  timestamp: number;
  note?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'adjustment' | 'investment';
export type TransactionStatus = 'pending' | 'completed' | 'rejected';

export interface InvestmentEvent {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'vacation' | 'shopping' | 'other';
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: UserId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reason: string;
  timestamp: number;
  handledBy?: UserId | 'System'; // Admin who approved/rejected
  handledAt?: number;
  eventId?: string; // ID of the InvestmentEvent if type is 'investment'
}
