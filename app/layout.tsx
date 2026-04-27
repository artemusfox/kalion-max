import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import ThemeProvider from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "KALION MAX",
  description: "Trainings-App für alle Sportarten · Plan · Tracking · Fortschritt",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kalion Max",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1218",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <Analytics />
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            btn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
            btn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
          }, { passive: true });
        ` }} />
      </body>
    </html>
  );
}
