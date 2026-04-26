import Link from "next/link";

export const metadata = {
  title: "Impressum · KALION MAX",
  description: "Anbieterkennzeichnung gemäß § 5 DDG",
};

export default function ImpressumPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <Link href="/" style={{ textDecoration: "none", color: "var(--text-dim)", fontSize: 13, fontWeight: 700 }}>
        ← Zurück
      </Link>

      <h1 style={{ fontSize: 36, fontStyle: "italic", marginTop: 24, marginBottom: 8, letterSpacing: -1 }}>
        Impressum
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 32 }}>
        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Anbieter</h2>
        <div style={{ fontSize: 15, lineHeight: 1.8 }}>
          {/* TODO: Diesen Block mit echten Daten befüllen, sobald c/o-Adresse aktiv ist */}
          <strong>[Vor- und Nachname]</strong><br />
          c/o [Anbietername — z.B. Clevvermail / Postsecur]<br />
          [Straße und Hausnummer]<br />
          [PLZ] [Stadt]<br />
          Deutschland
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Kontakt</h2>
        <div style={{ fontSize: 15, lineHeight: 1.8 }}>
          E-Mail: <a href="mailto:[deine-email@domain.de]" style={{ color: "var(--accent)" }}>[deine-email@domain.de]</a>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Verantwortlich für den Inhalt</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 8 }}>
          nach § 18 Abs. 2 MStV:
        </p>
        <div style={{ fontSize: 15, lineHeight: 1.8 }}>
          [Vor- und Nachname]<br />
          (Anschrift wie oben)
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Streitschlichtung</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Haftungsausschluss</h2>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>Haftung für Inhalte</h3>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
          Die Inhalte dieser App wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
          der Trainings- und Ernährungsempfehlungen kann keine Gewähr übernommen werden. Die App ersetzt keine medizinische
          Beratung. Bei gesundheitlichen Bedenken konsultiere bitte einen Arzt oder qualifizierten Trainer.
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>Haftung für Links</h3>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Diese App enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </p>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "var(--surface)", borderRadius: 12, fontSize: 12, color: "var(--text-muted)" }}>
        <strong>📝 Hinweis für den Betreiber:</strong> Diese Seite enthält Platzhalter in eckigen Klammern.
        Bevor die App öffentlich geht, müssen diese durch die echten Daten ersetzt werden.
        Siehe <code>RECHTLICHES.md</code> im Projekt für Details zu c/o-Adressen.
      </div>
    </div>
  );
}
