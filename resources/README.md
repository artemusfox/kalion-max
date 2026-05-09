# Capacitor Assets

Hier liegen die Source-Files für App-Icon und Splash-Screen.
Capacitor generiert daraus automatisch alle Größen für Android (und iOS später).

## Erforderliche Files

Lege folgende drei PNGs in diesen Ordner:

### `icon.png` (1024×1024)
Das App-Icon für den Launcher. Quadratisch, ohne Transparenz an den Rändern (Android schneidet sonst weg). Dein Lion-Logo auf einem Gradient-Hintergrund passt gut.

### `icon-foreground.png` (1024×1024)
Adaptive Icon Foreground — nur das Lion-Symbol mittig, **mit Padding** (logical content nur in der inneren 66% Fläche, weil Android das Icon je nach Phone-Theme rund/quadratisch/squircle ausschneidet).

### `icon-background.png` (1024×1024)
Adaptive Icon Background — eine Volltonfarbe oder dezenter Gradient. Z. B. dein Akzent-Cyan auf Slate (`#0f1218`). Wird hinter dem Foreground gezeigt.

### `splash.png` (2732×2732)
Splash-Screen — Logo zentriert auf dunklem Hintergrund, viel Padding rundum (verschiedene Geräte schneiden unterschiedlich). Hintergrund-Farbe sollte mit `capacitor.config.ts` matchen (`#0f1218`).

## Generieren der Android-Assets

Sobald die 4 Source-Files hier liegen:

```bash
npm run cap:assets
```

`@capacitor/assets` generiert automatisch alle Größen (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi für Icons, Splash für verschiedene Devices) und legt sie an die richtigen Stellen unter `android/app/src/main/res/...`.

## Tools zum Erstellen

Wenn du die Source-Files noch nicht hast:

- **Figma / Photoshop** — manuell zusammenbauen
- **https://icon.kitchen** — kostenloser Online-Generator für adaptive icons
- **https://easyappicon.com** — generiert alle Größen aus 1× Master-Icon
