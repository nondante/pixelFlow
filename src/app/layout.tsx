import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelFlow - High-Performance Image Gallery",
  description: "Performance-optimized infinite scrolling image gallery with masonry layout, advanced lazy loading, and virtual scrolling",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PixelFlow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('pixelflow-theme');
                  if (stored) {
                    const { state } = JSON.parse(stored);
                    const theme = state?.theme || 'light';

                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
