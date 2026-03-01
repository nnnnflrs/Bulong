import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Bulong",
  description:
    "A global anonymous audio-sharing platform. Record your feelings, pin them to the map, and listen to the world.",
  openGraph: {
    title: "Bulong",
    description: "Listen to the world. Share your voice anonymously.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-bulong-950 text-white`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
