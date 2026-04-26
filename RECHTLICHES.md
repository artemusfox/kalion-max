# 📜 Rechtliches Setup für KALION MAX

Diese Anleitung führt dich durch die rechtlichen Schritte, die **vor dem Public Launch** der App erledigt werden müssen — speziell auf den Weg mit einer **c/o-Adresse** zugeschnitten.

---

## ✅ Was bereits in der App vorbereitet ist

- `/impressum` — Impressum-Seite mit Platzhaltern (`[in eckigen Klammern]`)
- `/datenschutz` — Vollständige Datenschutzerklärung nach DSGVO + DDG/TDDDG
- Footer mit Verlinkung auf beide Seiten (in Landing + Dashboard)
- Datenschutz-Hinweis in der Signup-Form

**Was du tun musst:** Die Platzhalter durch echte Daten ersetzen.

---

## 📬 Schritt 1: c/o-Adresse einrichten

### Anbieter-Vergleich (Stand 2026)

| Anbieter | Preis/Monat | Vorteil | Hinweis |
|---|---|---|---|
| **Clevvermail** | ab 12 € | Bekanntester Anbieter, Adressen in vielen Großstädten | Briefe werden gescannt (bequem) |
| **Postsecur** | ab 10 € | Günstig, einfach | Briefe per Weiterleitung oder Abholung |
| **Hotline.de** | ab 15 € | Inkludiert oft Telefonnummer | Mehr für Geschäftskunden ausgelegt |
| **eRecht24 Adressdienst** | ab 9,90 € | Speziell für Webseitenbetreiber | Preisgünstig |

### Was du beachten musst

1. **Ladungsfähig** — Die Adresse muss eindeutig sein und Postzustellung ermöglichen. Reine "virtuelle" Adressen ohne Briefkasten sind **nicht** zulässig.
2. **Identitätsprüfung** — Anbieter machen meist eine Ident-Prüfung (Postident oder VideoIdent). Brauchst du Personalausweis.
3. **Vertragslaufzeit** — Achte auf Mindestlaufzeit (oft 6-12 Monate) und Kündigungsfrist.
4. **Eigene Wohnadresse separat** — Falls du beim Anbieter umziehst, ändert sich die c/o-Adresse, aber nicht deine Privatadresse.

### Empfehlung
Wenn du nur die App betreibst und keine Firma gründest: **Clevvermail oder eRecht24** — beide sind günstig und unkompliziert.

---

## 📝 Schritt 2: Daten in der App eintragen

Öffne in deinem Code-Editor folgende zwei Dateien:

### `app/impressum/page.tsx`
Ersetze alle `[Platzhalter]` durch deine echten Daten:

```
[Vor- und Nachname]                → Max Mustermann
[Anbietername]                     → Clevvermail
[Straße und Hausnummer]            → Musterstraße 12
[PLZ] [Stadt]                      → 10115 Berlin
[deine-email@domain.de]            → kontakt@deinedomain.de
```

### `app/datenschutz/page.tsx`
Gleiche Platzhalter ersetzen, plus:

```
[Datum eintragen, z.B. April 2026] → das aktuelle Datum
```

**Wichtig:** Die Hinweis-Boxen am Seitenende ("📝 Hinweis für den Betreiber") kannst du dann entfernen, sobald die echten Daten drin sind.

---

## 🛡️ Schritt 3: Supabase + Vercel DSGVO-konform konfigurieren

### Supabase
1. Login → Projekt → **Settings** → **General**
2. Region prüfen: muss **Frankfurt (eu-central-1)** sein
3. **Settings** → **Database** → Backups auf **Daily** lassen
4. **Authentication** → **Providers** → **Email** → "Confirm email" **AN** (verhindert Fake-Accounts)

### Vercel
1. Login → Projekt → **Settings** → **Functions**
2. Region auf **Frankfurt (fra1)** setzen
3. **Settings** → **Environment Variables** prüfen, dass die Supabase-Keys nicht im öffentlichen Code stehen

### AVV (Auftragsverarbeitungsverträge)
Beide Anbieter haben Standard-AVV, die du in deinem Account akzeptieren kannst:
- **Supabase:** [supabase.com/legal/dpa](https://supabase.com/legal/dpa)
- **Vercel:** [vercel.com/legal/dpa](https://vercel.com/legal/dpa)

Beide werden automatisch wirksam, sobald du den Service nutzt — du musst aber die Links in deiner Datenschutzerklärung haben (sind bereits drin).

---

## 🧪 Schritt 4: Vor-Launch-Checkliste

Bevor du die App öffentlich machst:

- [ ] c/o-Adresse aktiv und ID-verifiziert
- [ ] Alle `[Platzhalter]` in Impressum + Datenschutz ersetzt
- [ ] Datum in Datenschutz aktualisiert
- [ ] Hinweis-Boxen am Seitenende entfernt
- [ ] Test-Account angelegt — Datenexport funktioniert? Account-Löschung funktioniert?
- [ ] E-Mail-Bestätigung in Supabase aktiv
- [ ] Supabase + Vercel auf EU-Region
- [ ] App auf Mobile getestet
- [ ] Mindestens 1-2 Beta-Tester durchgejagt
- [ ] Domain registriert (z.B. bei Hetzner, Namecheap)

---

## ⚖️ Schritt 5 (optional, aber empfohlen): Rechtsberatung

Diese Vorlagen sind **solide Startpunkte**, ersetzen aber keine Rechtsberatung. Wenn du sicher gehen willst:

- **eRecht24 Premium** (ca. 17 €/Monat) — automatisch aktualisierte Texte
- **Anwalt für IT-Recht** — einmalige Prüfung kostet ca. 200-400 € und gibt Sicherheit

Für eine kostenlose App mit überschaubarem Risiko reicht aber meistens die Lösung mit den Templates aus dieser App + c/o-Adresse.

---

## 🚨 Was passiert bei Fehlern?

Wenn jemand dein Impressum bemängelt (z.B. weil Platzhalter noch drin sind), gibt es typischerweise zwei Eskalationsstufen:

1. **Hinweis per Mail** — fix die Sache binnen 1-2 Tagen, alles okay
2. **Abmahnung durch Anwalt** — ca. 500-1500 € Kosten + Unterlassungserklärung

Daher: **vor Launch alle Platzhalter wirklich ersetzen.** Lieber 1 Stunde mehr Sorgfalt als 1000 € Abmahnkosten.

---

## 📞 Bei Fragen

Wenn unklar ist, ob du etwas richtig gemacht hast: **lieber einmal zu viel beim Anwalt nachfragen**. 30 Min Beratung kostet meistens 50-100 € und ist gut investiert vor einem Launch.

Viel Erfolg! ⚡
