import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabCanvas - Real-Time Collaborative Canvas",
  description: "A real-time collaborative canvas with AI-powered design tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

