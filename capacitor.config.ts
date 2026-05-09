import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.kalionmax.android",
  appName: "Kalion Max",
  // Dummy-Verzeichnis — wir nutzen Server-URL-Modus, also lädt die App
  // den Live-Stand von Vercel statt embeddete statische Files.
  webDir: "public",

  server: {
    // Im Production-Build: WebView lädt deine Vercel-URL
    url: "https://kalion-max.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },

  android: {
    backgroundColor: "#0f1218",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#0f1218",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f1218",
      overlaysWebView: false,
    },
    App: {
      // Verhindert dass Android-Back-Button die App schließt — geht stattdessen zum Vorgang zurück
      launchUrl: "https://kalion-max.vercel.app",
    },
  },
};

export default config;
