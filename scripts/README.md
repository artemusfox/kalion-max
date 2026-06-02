# Kalion Max — Beta-User-Seed

Erstellt 20 Demo-Accounts mit realistischen Profilen, Workouts, PRs und Cardio-Sessions —
80% deutschsprachig (DE/AT/CH), 20% international (US/CA/FR/NL).

## 0) Voraussetzung — Migrationen ausführen

Im **Supabase SQL-Editor** einmalig ausführen:

```sql
-- Inhalt aus supabase/RUN_ME_NOW.sql kopieren und einfügen
```

Das umfasst:
- `activity_migration.sql` — schaltet den Community-Activity-Feed im Dashboard frei
- `cardio_migration.sql` — Tabellen für Cardio-Sessions + GPS-Tracks
- `pro_grant_migration.sql` — Pro-Status kostenfrei vergeben
- `beta_users_migration.sql` — `is_beta`-Flag + Cleanup-RPC

> Erst danach verschwindet die Meldung
> *"Aktivitäts-Feed noch nicht aktiv — Admin muss activity_migration.sql ausführen"*
> aus dem Dashboard.

## 1) Lokale ENV-Variablen prüfen

In `.env.local` müssen stehen:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # <-- der SECRET key, NICHT der anon-Key!
```

> ⚠️ Der **Service-Role-Key** umgeht RLS und kann User anlegen.
> Niemals in Git committen. Niemals als `NEXT_PUBLIC_` exposen.
> Auf Vercel ist er als Secret unter "Environment Variables" hinterlegt.

## 2) Dependencies installieren

Einmalig:

```powershell
npm install
```

(installiert `tsx` und `dotenv` als devDependencies, die für das Script gebraucht werden)

## 3) Seed-Script ausführen

```powershell
npm run seed:beta
```

Ausgabe sieht ungefähr so aus:

```
🚀 Seeding 20 Beta-User…

[01/20] Lukas M. (DE)… ✓
[02/20] Felix S. (DE)… ✓
[03/20] Sarah W. (DE)… ✓
...
[20/20] Sophie D. (FR)… ✓

═══════════════════════════════════════════════════════════
  ✓ 20 BETA-USER ERFOLGREICH ANGELEGT
═══════════════════════════════════════════════════════════

Login-Credentials für deine Beta-Tester:

  Lukas M.              [DE]
    📧 beta01@kalion-max.app
    🔑 KalionBeta01!472

  ...

📄 Credentials zusätzlich gespeichert in: beta-credentials.tsv
```

Die Datei `beta-credentials.tsv` ist ein Tab-separated File mit allen Logins.

> 🔒 Die TSV ist in `.gitignore` ausgeschlossen. Auf keinen Fall committen.
> Per Signal/Threema/Encrypted-Mail an die Tester verteilen.

## 4) Verifikation

- Dashboard öffnen mit deinem Admin-Account
- Community-Feed sollte jetzt aktiv sein und Aktivitäten der Beta-User zeigen
- Im Admin-User-Panel (`/dashboard/admin/users`) tauchen die 20 Beta-Accounts auf
- Du kannst jeden Beta-User detailliert betrachten

## 5) Beta-Markierung

Alle erzeugten Accounts haben `is_beta = true` und sehen in der Nav-Bar einen
gelb-orange-glühenden **BETA**-Badge. Echte Nutzer sehen den Badge nicht.

## 6) Cleanup vor Production

Bevor du echte Nutzer Marketing-Push gibst, alle Beta-User entfernen:

Im Supabase SQL-Editor (als Admin eingeloggt):

```sql
select admin_delete_all_beta_users();
```

Die RPC löscht alle Accounts mit `is_beta = true` aus `auth.users` —
Cascade löscht automatisch:
- profiles
- workouts
- personal_records
- cardio_sessions
- cardio_tracks
- alle anderen User-bezogenen Daten

Die RPC gibt die Anzahl gelöschter User als Integer zurück.

## Troubleshooting

**`Cannot find module 'dotenv'`** → `npm install` ausführen

**`Invalid API key`** → `SUPABASE_SERVICE_ROLE_KEY` falsch oder leer in `.env.local`

**`User already registered`** → Beta-User schon vorhanden. Erst Cleanup, dann erneut seeden.

**Script bricht ab nach paar Usern** → Rate-Limit von Supabase Auth Admin API.
  Warte 60 Sekunden, starte das Script nochmal. Bereits angelegte User werden
  beim erneuten Versuch übersprungen (email-conflict).
