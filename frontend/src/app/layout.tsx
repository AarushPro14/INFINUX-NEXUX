import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/auth-session-provider";

export const metadata: Metadata = {
  title: "INFINUX NEXUX",
  description: "A private business workspace by Aarushi Infotech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><AuthSessionProvider>{children}</AuthSessionProvider></body>
    </html>
  );
}
