import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maverro — Research at Market Speed",
  description:
    "A high-speed, voice-first AI research copilot for hedge fund analysts.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
