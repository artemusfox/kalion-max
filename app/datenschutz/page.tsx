import Link from "next/link";

export const metadata = {
  title: "Datenschutzerklärung · KALION MAX",
  description: "Datenschutzerklärung gemäß DSGVO",
};

export default function DatenschutzPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <Link href="/" style={{ textDecoration: "none", color: "var(--text-dim)", fontSize: 13, fontWeight: 700 }}>
        ← Zurück
      </Link>

      <h1 style={{ fontSize: 36, marginTop: 24, marginBottom: 8, letterSpacing: -1 }}>
        Datenschutz
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 32 }}>
        Stand: [Datum eintragen, z.B. April 2026]
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>1. Verantwortlicher</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
          Verantwortlich für die Verarbeitung personenbezogener Daten im Sinne der DSGVO ist:
        </p>
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          [Vor- und Nachname]<br />
          c/o [Anbietername]<br />
          [Straße und Hausnummer]<br />
          [PLZ] [Stadt]<br />
          E-Mail: <a href="mailto:[deine-email@domain.de]" style={{ color: "var(--accent)" }}>[deine-email@domain.de]</a>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>2. Erhobene Daten</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
          Bei der Nutzung von KALION MAX werden folgende Daten verarbeitet:
        </p>
        <ul style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, paddingLeft: 24 }}>
          <li>E-Mail-Adresse und Passwort (Hash) für die Registrierung</li>
          <li>Selbst eingegebene Trainingsdaten (Pläne, Workouts, Sätze, Wiederholungen, Gewichte)</li>
          <li>Selbst eingegebene Körperdaten (Gewicht, Körpermaße, optional: Progress-Fotos)</li>
          <li>Selbst eingegebene Ernährungsdaten (Mahlzeiten, Supplements, Wasser)</li>
          <li>Selbst gesetzte Ziele und gesammelte Badges</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>3. Rechtsgrundlage</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Die Verarbeitung erfolgt zur Erfüllung des Nutzungsvertrags gemäß <strong>Art. 6 Abs. 1 lit. b DSGVO</strong>
          {" "}sowie auf Basis deiner Einwilligung gemäß <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> bei freiwillig
          eingegebenen Gesundheitsdaten (Art. 9 DSGVO).
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>4. Auftragsverarbeiter</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 16 }}>
          Wir nutzen die folgenden Dienstleister im Sinne von <strong>Art. 28 DSGVO</strong>. Mit allen wurden
          Auftragsverarbeitungsverträge (AVV) geschlossen.
        </p>

        <div style={{ marginBottom: 16, padding: 14, background: "var(--bg-elevated)", borderRadius: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Supabase (Datenbank, Auth, Storage)</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Anbieter: Supabase Inc., 970 Toa Payoh North #07-04, Singapur 318992<br />
            Server-Standort: Frankfurt am Main, Deutschland (EU-Region)<br />
            Zweck: Speicherung deiner Trainingsdaten, Authentifizierung, Bilder-Hosting<br />
            Datenschutzerklärung: <a href="https://supabase.com/privacy" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>supabase.com/privacy</a>
          </p>
        </div>

        <div style={{ marginBottom: 16, padding: 14, background: "var(--bg-elevated)", borderRadius: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Vercel (Hosting)</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Anbieter: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
            Server-Standort: Frankfurt (fra1) — EU-Region konfiguriert<br />
            Zweck: Auslieferung der Web-Anwendung<br />
            Datenschutzerklärung: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>vercel.com/legal/privacy-policy</a><br />
            <em style={{ fontSize: 12 }}>Da Vercel ein US-Anbieter ist, kommt das EU-US Data Privacy Framework zur Anwendung.</em>
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>5. Cookies & lokaler Speicher</h2>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 8, marginBottom: 6 }}>Notwendig (einwilligungsfrei)</h3>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 8 }}>
          Diese Cookies und Speichereinträge sind technisch zwingend nötig, damit du die App nutzen kannst.
          Sie sind nach <strong>§ 25 Abs. 2 Nr. 2 TDDDG</strong> einwilligungsfrei.
        </p>
        <ul style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, paddingLeft: 24, marginBottom: 14 }}>
          <li>Supabase Auth-Session-Cookie (HTTP-only) — hält dich eingeloggt</li>
          <li>Theme-/Sprach-/Hintergrund-Auswahl im localStorage — UX-Präferenzen</li>
          <li>2FA-Faktor-IDs falls aktiviert — Login mit zweitem Faktor</li>
        </ul>

        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 6 }}>Optional (mit Einwilligung)</h3>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 8 }}>
          Diese Datenverarbeitung erfolgt nur, wenn du beim Cookie-Banner aktiv eingewilligt hast.
          Deine Einwilligung kannst du jederzeit über den Footer-Link <em>"Cookie-Einstellungen"</em> widerrufen.
        </p>
        <ul style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, paddingLeft: 24 }}>
          <li>
            <strong>Vercel Web Analytics</strong> — anonymisierte Reichweitenmessung (Seitenaufrufe, Web Vitals).
            Nutzt keine Cookies. IP-Adressen werden zur Geolokalisation kurzzeitig verarbeitet und sofort verworfen.
            Keine personenbezogene Profilbildung. Anbieter: Vercel Inc. (USA, EU-US Data Privacy Framework).
          </li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>6. Deine Rechte</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
          Du hast jederzeit folgende Rechte:
        </p>
        <ul style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, paddingLeft: 24 }}>
          <li><strong>Auskunft</strong> über deine gespeicherten Daten (Art. 15 DSGVO)</li>
          <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
          <li><strong>Löschung</strong> deiner Daten (Art. 17 DSGVO)</li>
          <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
          <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
          <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li><strong>Beschwerde</strong> bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 12 }}>
          Du kannst deine Daten jederzeit selbst exportieren (JSON-Backup unter <strong>Einstellungen</strong>)
          und deinen Account vollständig löschen. Auf Anfrage per E-Mail bestätigen wir dir die Löschung schriftlich.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>7. Speicherdauer</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Deine Daten bleiben gespeichert, solange dein Account aktiv ist. Bei Account-Löschung werden alle
          personenbezogenen Daten innerhalb von 30 Tagen aus den Produktivsystemen entfernt. Backup-Kopien werden
          spätestens nach 30 Tagen automatisch überschrieben.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>8. Änderungen</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder bei
          Änderungen der App und ihrer Funktionen anzupassen. Die jeweils aktuelle Version ist auf dieser Seite verfügbar.
        </p>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "var(--surface)", borderRadius: 12, fontSize: 12, color: "var(--text-muted)" }}>
        <strong>📝 Hinweis für den Betreiber:</strong> Diese Datenschutzerklärung ist ein <strong>solider Startpunkt</strong>,
        ersetzt aber keine individuelle Rechtsberatung. Vor dem Public-Launch empfiehlt sich eine Prüfung durch einen Anwalt
        oder die Nutzung eines kostenpflichtigen Generators wie <a href="https://www.e-recht24.de" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>eRecht24 Premium</a>.
      </div>
    </div>
  );
}
