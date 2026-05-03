// ═══════════════════════════════════════════════════════════
// Mehrsprachigkeit — DE / EN
// ═══════════════════════════════════════════════════════════

export type Lang = "de" | "en";

export const LANGUAGES: { id: Lang; label: string; flag: string }[] = [
  { id: "de", label: "Deutsch", flag: "🇩🇪" },
  { id: "en", label: "English", flag: "🇬🇧" },
];

type Dict = Record<string, { de: string; en: string }>;

export const T = {
  // ── HOME / LANDING ──
  "home.tagline.html": {
    de: "Deine Trainings-App für <strong>alle Sportarten</strong>. Plane, tracke und dominiere dein Training — egal ob Kurzhantel, Barren, Asphalt oder Yoga-Matte.",
    en: "Your training app for <strong>all sports</strong>. Plan, track, and dominate your training — whether dumbbell, parallettes, asphalt or yoga mat.",
  },
  "home.cta.signup":     { de: "Kostenlos starten →",    en: "Get started — free →" },
  "home.cta.login":      { de: "Einloggen",              en: "Sign in" },
  "home.sports.heading": { de: "Für jede Sportart",      en: "Every sport" },

  // ── SPORTS ──
  "sport.strength":     { de: "Gym & Gewicht",     en: "Gym & Weights" },
  "sport.calisthenics": { de: "Calisthenics",      en: "Calisthenics" },
  "sport.cardio":       { de: "Cardio",            en: "Cardio" },
  "sport.hiit":         { de: "HIIT / Functional", en: "HIIT / Functional" },
  "sport.mobility":     { de: "Mobility / Yoga",   en: "Mobility / Yoga" },

  // ── MUSCLES ──
  "muscle.chest":     { de: "Brust",       en: "Chest" },
  "muscle.back":      { de: "Rücken",      en: "Back" },
  "muscle.shoulders": { de: "Schultern",   en: "Shoulders" },
  "muscle.arms":      { de: "Arme",        en: "Arms" },
  "muscle.legs":      { de: "Beine",       en: "Legs" },
  "muscle.glutes":    { de: "Gesäß",       en: "Glutes" },
  "muscle.core":      { de: "Core",        en: "Core" },
  "muscle.fullbody":  { de: "Ganzkörper",  en: "Full Body" },
  "muscle.cardio":    { de: "Cardio",      en: "Cardio" },

  // ── EQUIPMENT ──
  "eq.none":         { de: "Kein Equipment",     en: "No Equipment" },
  "eq.barbell":      { de: "Langhantel",         en: "Barbell" },
  "eq.dumbbell":     { de: "Kurzhantel",         en: "Dumbbell" },
  "eq.kettlebell":   { de: "Kettlebell",         en: "Kettlebell" },
  "eq.machine":      { de: "Maschine",           en: "Machine" },
  "eq.cable":        { de: "Seilzug",            en: "Cable" },
  "eq.band":         { de: "Widerstandsband",    en: "Resistance Band" },
  "eq.pullup_bar":   { de: "Klimmzugstange",     en: "Pull-up Bar" },
  "eq.parallettes":  { de: "Parallettes",        en: "Parallettes" },
  "eq.bench":        { de: "Bank",               en: "Bench" },
  "eq.treadmill":    { de: "Laufband",           en: "Treadmill" },
  "eq.bike":         { de: "Fahrrad",            en: "Bike" },
  "eq.rower":        { de: "Rudergerät",         en: "Rower" },
  "eq.jumprope":     { de: "Springseil",         en: "Jump Rope" },
  "eq.mat":          { de: "Matte",              en: "Mat" },

  // ── COMMON / ACTIONS ──
  "common.save":     { de: "Speichern",          en: "Save" },
  "common.cancel":   { de: "Abbrechen",          en: "Cancel" },
  "common.delete":   { de: "Löschen",            en: "Delete" },
  "common.edit":     { de: "Bearbeiten",         en: "Edit" },
  "common.add":      { de: "Hinzufügen",         en: "Add" },
  "common.close":    { de: "Schließen",          en: "Close" },
  "common.back":     { de: "Zurück",             en: "Back" },
  "common.next":     { de: "Weiter",             en: "Next" },
  "common.confirm":  { de: "Bestätigen",         en: "Confirm" },
  "common.loading":  { de: "Lade...",            en: "Loading..." },
  "common.email":    { de: "E-Mail",             en: "Email" },
  "common.password": { de: "Passwort",           en: "Password" },
  "common.optional": { de: "Optional",           en: "Optional" },
  "common.required": { de: "Pflicht",            en: "Required" },
  "common.yes":      { de: "Ja",                 en: "Yes" },
  "common.no":       { de: "Nein",               en: "No" },
  "common.search":   { de: "Suchen…",            en: "Search…" },
  "common.none":     { de: "Keine",              en: "None" },
  "common.error":    { de: "Fehler",             en: "Error" },

  // ── AUTH / LOGIN ──
  "auth.welcome.back":     { de: "Willkommen zurück",   en: "Welcome back" },
  "auth.signin.sub":       { de: "Melde dich mit deinem Account an", en: "Sign in to your account" },
  "auth.signin.btn":       { de: "Einloggen",           en: "Sign in" },
  "auth.signup.title":     { de: "Konto erstellen",     en: "Create account" },
  "auth.signup.sub":       { de: "Starte deine Trainings-Reise", en: "Start your training journey" },
  "auth.signup.btn":       { de: "Konto erstellen",     en: "Create account" },
  "auth.signup.name":      { de: "Anzeigename",         en: "Display name" },
  "auth.signup.name.ph":   { de: "Dein Name",           en: "Your name" },
  "auth.password.ph":      { de: "••••••••",            en: "••••••••" },
  "auth.email.ph":         { de: "du@example.com",      en: "you@example.com" },
  "auth.no.account":       { de: "Noch keinen Account?", en: "No account yet?" },
  "auth.have.account":     { de: "Schon einen Account?", en: "Already have an account?" },
  "auth.register":         { de: "Registrieren",        en: "Register" },
  "auth.signin.link":      { de: "Einloggen",           en: "Sign in" },
  "auth.forgot":           { de: "Passwort vergessen?", en: "Forgot password?" },
  "auth.welcome.toast":    { de: "Willkommen zurück! ⚡", en: "Welcome back! ⚡" },
  "auth.bye.toast":        { de: "Bis bald! 👋",        en: "See you! 👋" },

  // ── 2FA ──
  "mfa.title":        { de: "🔐 Zwei-Faktor",                  en: "🔐 Two-Factor" },
  "mfa.sub.totp":     { de: "Code aus deiner Authenticator-App", en: "Code from your authenticator app" },
  "mfa.sub.recovery": { de: "Notfall-Code eingeben",            en: "Enter recovery code" },
  "mfa.use.recovery": { de: "🆘 Notfall-Code verwenden",        en: "🆘 Use recovery code" },
  "mfa.back.totp":    { de: "← Zurück zum App-Code",            en: "← Back to app code" },
  "mfa.cancel":       { de: "Abbrechen / Logout",               en: "Cancel / Logout" },
  "mfa.verified":     { de: "Verifiziert ⚡",                    en: "Verified ⚡" },
  "mfa.recovery.warn": {
    de: "⚠️ Ein Notfall-Code setzt deine 2FA zurück. Du wirst danach zum Settings geleitet, um sie neu einzurichten.",
    en: "⚠️ A recovery code resets your 2FA. You'll be redirected to settings to set it up again.",
  },
  "mfa.recovery.consume": { de: "Code einlösen",                en: "Redeem code" },
  "mfa.confirm":          { de: "Bestätigen",                   en: "Confirm" },
  "mfa.code.invalid":     { de: "Code falsch oder abgelaufen",  en: "Code invalid or expired" },
  "mfa.code.invalid.recovery": { de: "Code ungültig oder bereits verwendet", en: "Code invalid or already used" },
  "mfa.reset.toast":      { de: "2FA wurde zurückgesetzt — bitte neu einrichten", en: "2FA reset — please set up again" },

  // ── NAVIGATION ──
  "nav.home":      { de: "Home",      en: "Home" },
  "nav.plans":     { de: "Pläne",     en: "Plans" },
  "nav.training":  { de: "Training",  en: "Training" },
  "nav.stats":     { de: "Stats",     en: "Stats" },
  "nav.body":      { de: "Körper",    en: "Body" },
  "nav.nutrition": { de: "Nutrition", en: "Nutrition" },
  "nav.goals":     { de: "Ziele",     en: "Goals" },
  "nav.settings":  { de: "Einstellungen", en: "Settings" },
  "nav.admin":     { de: "Admin",     en: "Admin" },
  "nav.logout":    { de: "Logout",    en: "Logout" },

  // ── DASHBOARD ──
  "dash.greeting.night":   { de: "Nachtschicht",      en: "Night shift" },
  "dash.greeting.morning": { de: "Guten Morgen",      en: "Good morning" },
  "dash.greeting.day":     { de: "Guten Tag",         en: "Hello" },
  "dash.greeting.evening": { de: "Guten Abend",       en: "Good evening" },
  "dash.hey":              { de: "Hey,",              en: "Hey," },
  "dash.athlete":          { de: "Athlete",           en: "Athlete" },
  "dash.activeplan":       { de: "Aktiver Plan",      en: "Active plan" },
  "dash.start.training":   { de: "▶ Training starten", en: "▶ Start training" },
  "dash.no.plan":          { de: "Kein aktiver Plan", en: "No active plan" },
  "dash.no.plan.desc":     {
    de: "Wähle eine Vorlage oder erstelle deinen eigenen Trainingsplan.",
    en: "Choose a template or create your own training plan.",
  },
  "dash.choose.plan":      { de: "Plan auswählen →",  en: "Choose plan →" },
  "dash.weeks":            { de: "Wochen",            en: "weeks" },
  "dash.level":            { de: "Level",             en: "Level" },
  "dash.xp":               { de: "XP",                en: "XP" },
  "dash.next.level":       { de: "XP zum nächsten Level", en: "XP to next level" },
  "dash.stat.workouts":    { de: "Workouts",          en: "Workouts" },
  "dash.stat.streak":      { de: "Streak",            en: "Streak" },
  "dash.stat.best":        { de: "Best",              en: "Best" },
  "dash.stat.records":     { de: "Records",           en: "Records" },
  "dash.recent":           { de: "📋 Letzte Workouts", en: "📋 Recent workouts" },
  "dash.recent.empty":     { de: "Noch keine Workouts — starte dein erstes!", en: "No workouts yet — start your first!" },
  "dash.features":         { de: "✨ Features",       en: "✨ Features" },
  "dash.feat.plans":       { de: "Pläne",             en: "Plans" },
  "dash.feat.plans.desc":  { de: "Templates + eigene Pläne", en: "Templates + custom plans" },
  "dash.feat.stats":       { de: "Stats & Tools",     en: "Stats & Tools" },
  "dash.feat.stats.desc":  { de: "PRs, 1RM, Recovery", en: "PRs, 1RM, Recovery" },
  "dash.feat.body":        { de: "Körpermaße",        en: "Body metrics" },
  "dash.feat.body.desc":   { de: "Gewicht, Umfänge, Fotos", en: "Weight, measurements, photos" },
  "dash.feat.nutrition":   { de: "Ernährung",         en: "Nutrition" },
  "dash.feat.nutrition.desc": { de: "Mahlzeiten, Supplements, Wasser", en: "Meals, supplements, water" },
  "dash.feat.goals":       { de: "Ziele",             en: "Goals" },
  "dash.feat.goals.desc":  { de: "Challenges & Badges", en: "Challenges & Badges" },
  "dash.sets":             { de: "Sätze",             en: "sets" },
  "dash.reps":             { de: "Wdh.",              en: "reps" },
  "dash.streak.ember":     { de: "Glut",              en: "Ember" },
  "dash.streak.flame":     { de: "Feuer",             en: "Flame" },
  "dash.streak.blaze":     { de: "Brand",             en: "Blaze" },
  "dash.streak.inferno":   { de: "Inferno",           en: "Inferno" },
  "dash.streak.supernova": { de: "Supernova",         en: "Supernova" },
  "dash.streak.out":       { de: "Erloschen",         en: "Extinguished" },

  // ── SETTINGS ──
  "settings.profile":       { de: "👤 Profil",                  en: "👤 Profile" },
  "settings.displayname":   { de: "Anzeigename",                en: "Display name" },
  "settings.theme":         { de: "🎨 Akzent-Farbe",            en: "🎨 Accent color" },
  "settings.theme.desc":    { de: "Wirkt sofort und gilt nur für dich auf diesem Gerät.", en: "Applies instantly, per device." },
  "settings.surface":       { de: "🎨 Hintergrund",             en: "🎨 Background" },
  "settings.surface.desc":  { de: "Stimmung der Flächen — Body und Karten.", en: "Mood of the surfaces — body and cards." },
  "settings.surface.dark":  { de: "🌑 Dunkel",                  en: "🌑 Dark" },
  "settings.surface.medium":{ de: "🌗 Mittel",                  en: "🌗 Medium" },
  "settings.surface.light": { de: "☀️ Hell",                    en: "☀️ Light" },
  "settings.units":         { de: "📐 Einheiten & Hantelscheiben", en: "📐 Units & weight plates" },
  "settings.units.desc":    { de: "Kg/Lbs, km/Meilen — und welche Hantelscheiben in deinem Studio liegen.", en: "Kg/Lbs, km/miles — and which weight plates are in your gym." },
  "settings.voice":         { de: "🔊 Workout-Sprachausgabe",  en: "🔊 Workout voice output" },
  "settings.voice.desc":    {
    de: "Beim Pausen-Timer wird der Countdown laut angesagt — freihändig im Gym.",
    en: "Rest timer countdown spoken aloud — hands-free at the gym.",
  },
  "settings.voice.unsupported": { de: "Dein Browser unterstützt keine Sprachausgabe.", en: "Your browser does not support voice output." },
  "settings.voice.on":      { de: "🔊 Sprache an — antippen zum Deaktivieren", en: "🔊 Voice on — tap to disable" },
  "settings.voice.off":     { de: "🔇 Sprache aus — antippen zum Aktivieren", en: "🔇 Voice off — tap to enable" },
  "settings.mfa":           { de: "🔐 Zwei-Faktor-Authentifizierung", en: "🔐 Two-factor authentication" },
  "settings.mfa.desc":      {
    de: "Zusätzlicher Schutz beim Login: 6-stelliger Code aus deiner Authenticator-App.",
    en: "Extra login protection: 6-digit code from your authenticator app.",
  },
  "settings.security":      { de: "🔒 Sicherheit",              en: "🔒 Security" },
  "settings.security.pw":   { de: "Passwort ändern",            en: "Change password" },
  "settings.data":          { de: "💾 Daten",                   en: "💾 Data" },
  "settings.data.export":   { de: "⬇️ Alle Daten exportieren (JSON)", en: "⬇️ Export all data (JSON)" },
  "settings.danger":        { de: "⚠️ Gefahrenzone",            en: "⚠️ Danger zone" },
  "settings.danger.desc":   {
    de: "Löschen deines Accounts entfernt ALLE deine Daten dauerhaft. Dies kann nicht rückgängig gemacht werden.",
    en: "Deleting your account permanently removes ALL your data. This cannot be undone.",
  },
  "settings.delete":        { de: "Account löschen",            en: "Delete account" },
  "settings.saved":         { de: "Profil gespeichert",         en: "Profile saved" },

  // ── COOKIES / CONSENT ──
  "consent.title":     { de: "🍪 Cookies & Datenschutz", en: "🍪 Cookies & Privacy" },
  "consent.desc":      {
    de: "KALION MAX nutzt technisch notwendige Cookies (Login-Session, Theme-Auswahl) und — nur mit deiner Einwilligung — anonyme Reichweitenanalyse via Vercel Web Analytics. Du kannst deine Wahl jederzeit über den Footer-Link ändern.",
    en: "KALION MAX uses technically necessary cookies (login session, theme choice) and — only with your consent — anonymous reach analysis via Vercel Web Analytics. You can change your choice anytime via the footer link.",
  },
  "consent.more":      { de: "Mehr erfahren",                en: "Learn more" },
  "consent.necessary": { de: "Nur notwendige",               en: "Necessary only" },
  "consent.all":       { de: "Alle akzeptieren",             en: "Accept all" },
  "consent.details.show": { de: "Details / Verwalten ↓",     en: "Details / Manage ↓" },
  "consent.details.hide": { de: "Details ausblenden ↑",      en: "Hide details ↑" },
  "consent.cat.necessary":      { de: "Notwendig",           en: "Necessary" },
  "consent.cat.necessary.sub":  { de: "Immer aktiv — für Login und App-Funktion erforderlich", en: "Always active — required for login and app function" },
  "consent.cat.analytics":      { de: "Reichweitenmessung",  en: "Analytics" },
  "consent.cat.analytics.sub":  { de: "Anonym, ohne IP-Speicherung — opt-in", en: "Anonymous, no IP storage — opt-in" },

  // ── FOOTER ──
  "footer.imprint":  { de: "Impressum",          en: "Imprint" },
  "footer.privacy":  { de: "Datenschutz",        en: "Privacy" },
  "footer.cookies":  { de: "Cookie-Einstellungen", en: "Cookie settings" },

  // ── HOME LANDING (already there) ──
  "home.feat.plans.title":    { de: "Flexible Pläne",       en: "Flexible plans" },
  "home.feat.plans.desc":     { de: "Vorlagen nutzen oder komplett eigene Workouts erstellen", en: "Use templates or build your own workouts from scratch" },
  "home.feat.tracking.title": { de: "Smart-Tracking",       en: "Smart tracking" },
  "home.feat.tracking.desc":  { de: "Gewicht, Reps, Zeit, Distanz — je nach Übung passend", en: "Weight, reps, time, distance — fits any exercise" },
  "home.feat.progress.title": { de: "Fortschritt",          en: "Progress" },
  "home.feat.progress.desc":  { de: "PRs, Level, XP, Badges und Streak-System", en: "PRs, levels, XP, badges and streak system" },
  "home.feat.body.title":     { de: "Körperdaten",          en: "Body metrics" },
  "home.feat.body.desc":      { de: "Messungen, Fotos, Ernährung und Recovery", en: "Measurements, photos, nutrition and recovery" },
  "lang.label": { de: "Sprache", en: "Language" },
} satisfies Dict;

export type TKey = keyof typeof T;

export function tr(key: TKey, lang: Lang): string {
  const entry = T[key];
  if (!entry) return key as string;
  return entry[lang] ?? entry.de;
}
