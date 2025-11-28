import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifelong Learning - Personal Growth Platform",
  description: "Hyper-personalized learning platform for continuous growth and skill development",
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
