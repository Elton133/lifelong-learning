import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillFlow - Corporate Learning Platform",
  description: "Hyper-personalized corporate learning platform - Spotify + Duolingo + GitHub for professional skill development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
