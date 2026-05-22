"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    // Auth pages: no sidebar/header, just the form centered on the background
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden sm:flex w-64 flex-col border-r border-slate-800 bg-slate-900/60">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="text-lg font-semibold tracking-tight">
            Juco Admin
          </div>
          <div className="text-xs text-slate-400">
            Manage lecturers, CRs & timetables
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            <span>Dashboard</span>
          </Link>
          <Link
            href="/users"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            <span>Users</span>
          </Link>
          <Link
            href="/class-reps"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            <span>CRs & timetables</span>
          </Link>
          <Link
            href="/academic"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            <span>Academic Setup</span>
          </Link>
          <Link
            href="/programmes"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            <span>Programme View</span>
          </Link>
          <Link
            href="/programmes/new"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            <span>Create Programme</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/40 px-4 py-3 sm:px-6">
          <h1 className="text-base font-medium text-slate-100">
            Juco Notify – Admin
          </h1>
        </header>
        <div className="px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  );
}

