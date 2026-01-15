import type { Metadata } from "next";
import "./globals.css"; // มั่นใจว่ามีไฟล์นี้อยู่

export const metadata: Metadata = {
  title: "Fishy And Chips 🐟 | จับโกหกปลาแดง", // ชื่อบนแท็บ Browser
  description: "เกมจับโกหก",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}