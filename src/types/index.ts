export type UserId = 'Ric' | 'Nadine' | 'Tyler' | 'Fee';

export type UserAvailability = 'available' | 'busy' | 'little_time' | 'unavailable';

export interface UserProfile {
  id: UserId;
  name: string;
  role: 'admin' | 'user';
  color: string;
  avatarUrl?: string;
  pin?: string; // Optional initially, set by user on first login
  darkMode?: boolean;
  availability: UserAvailability;
  xp: number;
}

export type TaskStatus = 'offen' | 'erledigt' | 'verifiziert';

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
}
