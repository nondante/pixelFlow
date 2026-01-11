import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelFlow - High-Performance Image Gallery",
  description: "Performance-optimized infinite scrolling image gallery with masonry layout, advanced lazy loading, and virtual scrolling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
