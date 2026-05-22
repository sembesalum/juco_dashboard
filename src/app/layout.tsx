import type { Metadata } from "next";
import "./globals.css";
import AdminShell from "./shell";

export const metadata: Metadata = {
  title: "Juco Admin Dashboard",
  description: "Admin dashboard for managing lecturers, CRs and schedules",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}

