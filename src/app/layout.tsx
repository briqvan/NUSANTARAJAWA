import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Nusantara — Petualangan Tanah Jawa",
  description:
    "Masuk ke dunia RPG teks bertema Nusantara. Petualangan epik menanti di Tanah Jawa — khususnya para pendekar, pengembara, dan Game Master.",
  keywords: [
    "Nusantara",
    "RPG",
    "Petualangan",
    "Tanah Jawa",
    "Game Master",
    "Indonesia",
    "Text RPG",
  ],
  authors: [{ name: "Nusantara Studios" }],
  icons: {
    icon: "/banner-default.png",
  },
  openGraph: {
    title: "Nusantara — Petualangan Tanah Jawa",
    description: "RPG teks bertema Nusantara. Masuk dan mulai petualanganmu.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
