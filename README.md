# ⚡ KALION MAX

**Die Trainings-App für alle Sportarten.** Plane, tracke und dominiere dein Training — egal ob Gym, Calisthenics, Cardio, HIIT oder Mobility.

## ✨ Features

### Flexibles Training
- 🏋️ **5 Sportarten** — Strength, Calisthenics, Cardio, HIIT, Mobility
- 📋 **Templates + eigene Pläne** — Vorlagen klonen oder komplett eigene Workouts zusammenstellen
- 🎯 **Flexibles Tracking** pro Übung: Reps+Gewicht, Reps-only, Zeit, Distanz, Zeit+Distanz
- 📚 **~80 vordefinierte Übungen** über alle Sportarten

### Workout-Modus
- 💪 Schritt-für-Schritt durch jedes Workout
- ⏱️ Automatische Pausen-Timer
- 📝 Satz-für-Satz tracken (Reps, Gewicht, Zeit — je nach Übung)
- 😊 Mood-Rating + Notizen nach jedem Workout

### Progress & Gamification
- 🏆 **Personal Records** pro Übung (flexibel für jede Tracking-Art)
- 🔥 **Streak-Tracking** mit Rekord
- ⭐ **Level-System** mit XP für jedes Workout
- 🏅 **14 Badges** zum Freischalten
- 🧮 **1RM-Rechner + Plate Calculator**

### Körper & Ernährung
- 📏 Körpermaße (6 Werte) mit Verlauf
- 📸 Progress-Fotos (privat in verschlüsseltem Storage)
- 🍽️ **Mahlzeiten-Tracking** mit Lebensmittel-Datenbank (80+ vordefinierte Foods)
- 📚 **Eigene Lebensmittel** erstellen (Meal-Prep, Eigenprodukte)
- ⭐ **Favoriten** markieren für schnellen Zugriff
- 🥗 Automatische Makro-Berechnung (Kalorien, Protein, Carbs, Fett)
- 🌅 4 Mahlzeit-Typen: Frühstück, Mittag, Abend, Snack
- 💊 **Supplement-Tracker** mit 12 Vorlagen (Whey, Creatin, Vitamine, etc.)
- ⏰ Einnahmezeitpunkte (morgens, vor/nach Training, abends)
- 📊 7-Tage Supplement-Historie
- 💧 Wasser-Tracker

### User-System
- 🔐 E-Mail-Login + Passwort-Reset
- 🛡️ Alle Daten privat (Row-Level-Security in Supabase)
- 💾 JSON-Export aller Daten
- 🌍 Online zugänglich auf allen Geräten

## 🚀 Setup

**Für Anfänger:** Lies `SETUP.md` — dort steht alles Schritt für Schritt (ca. 90 Min zum Live-Deploy).

**Für Entwickler:**
```bash
npm install
cp .env.example .env.local  # Supabase-Werte eintragen
npm run dev
```

SQL-Schema: `supabase/schema.sql` in den Supabase SQL Editor kopieren und ausführen.

## 🛠 Tech Stack

- **Next.js 15** (App Router, Server Components, TypeScript)
- **Supabase** (Postgres, Auth, Storage, RLS)
- **Vercel** (Hosting)
- **Custom CSS** (keine UI-Library)

## 📁 Struktur

```
app/
  page.tsx                  # Landing
  auth/                     # Login/Signup/Reset
  dashboard/
    page.tsx                # Home mit aktivem Plan
    plans/                  # Pläne (Templates + eigene)
    plans/[id]/             # Plan-Editor
    training/               # Aktive Woche + Workout starten
    progress/               # PRs + Tools
    body/                   # Messungen + Fotos
    nutrition/              # Kalorien + Wasser
    goals/                  # Ziele + Badges + Level
    settings/               # Profil + Export
components/
  AppNav.tsx
  WorkoutSession.tsx        # Flexibler Workout-Modus
lib/
  types.ts                  # Sport/Muscle/Equipment/Tracking/Badges
  exercises.ts              # ~80 Übungen
  templates.ts              # 6 Template-Pläne
  foods.ts                  # Lebensmittel-DB + Supplement-Vorlagen
  supabase-client.ts
  supabase-server.ts
supabase/
  schema.sql                # Komplettes DB-Schema
```

## ⚖️ Rechtliches

Vor dem Public Launch müssen Impressum und Datenschutz mit echten Daten befüllt werden. Siehe **[RECHTLICHES.md](RECHTLICHES.md)** für eine Schritt-für-Schritt-Anleitung mit c/o-Adressen-Anbieter-Vergleich.

## 📜 Lizenz

Privat.
