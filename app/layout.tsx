import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sost · Ethiopian Time, Calendar & Numeral Converter",
  description: "Convert world time to East Africa Time, Gregorian dates to the Ethiopian calendar, and Arabic numerals to Ge'ez numerals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Loaded via CDN link (rather than next/font) so font files are
            fetched by the browser at runtime, not by the build process. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
