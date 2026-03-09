# To-Do Liste für die nächste Sitzung

## 1. Master State in Firebase
- **Problem:** Geräte synchronisieren nur, wenn andere Geräte online sind (Event-Sourcing REQUEST_FULL_SYNC).
- **Lösung:** Den kompletten useStore-State regelmäßig als ein zentrales Master-Dokument in Firestore (/states/master) ablegen.
- **Aufwand:** Mittel. Erfordert Änderungen im syncService.ts und useStore.ts (Start-Logik).

## 2. Code Refactoring (Aufräumen)
- **Problem:** Riesige Komponenten-Dateien (z.B. Dashboard.tsx, Penalties.tsx), die schwer zu warten sind.
- **Lösung:** Auslagern von logischen Blöcken in kleinere, wiederverwendbare Komponenten (z.B. Modal-Dialoge, Formulare) im Ordner /components.
- **Aufgabe:** Code umstrukturieren, **ohne** dabei bestehende Funktionalität zu beschädigen.
- **Aufwand:** Mittel. Erfordert systematisches Vorgehen und anschließendes Testing aller Funktionen.