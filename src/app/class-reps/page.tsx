"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminMonitorWithTimetables,
  TimetableItem,
  apiFetch,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function ClassRepsTimetablesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminMonitorWithTimetables[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | undefined>(undefined);

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setTokenState(stored);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<AdminMonitorWithTimetables[]>(
          "/admin/monitors/timetables",
          {},
          token
        );
        if (!cancelled) setRows(data);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">
          CRs & timetables
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Every CR account and the timetable entries they created for lecturers.
        </p>
      </div>

      {loading && (
        <p className="text-xs text-slate-400">Loading CRs…</p>
      )}
      {!loading && error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="text-xs text-slate-500">No CRs found.</p>
      )}

      <div className="space-y-4">
        {!loading &&
          !error &&
          rows.map((cr) => (
            <section
              key={cr.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                <div>
                  <h3 className="text-sm font-medium text-slate-100">
                    {cr.first_name} {cr.last_name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {cr.email}
                    {cr.registration_number
                      ? ` • ${cr.registration_number}`
                      : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Programme:{" "}
                    <span className="text-slate-300">
                      {cr.programme_name ?? "— not set —"}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/users/${cr.id}`}
                  className="shrink-0 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Edit user →
                </Link>
              </div>
              <div className="px-4 py-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Created timetables ({cr.monitor_timetables?.length ?? 0})
                </p>
                <CrTimetableTable items={cr.monitor_timetables ?? []} />
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}

function CrTimetableTable({ items }: { items: TimetableItem[] }) {
  if (!items.length) {
    return (
      <p className="text-xs text-slate-500">
        This CR has not created any timetable entries yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full text-left text-[11px]">
        <thead className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
          <tr>
            <th className="px-2 py-1.5 font-medium">Subject</th>
            <th className="px-2 py-1.5 font-medium">Lecturer</th>
            <th className="px-2 py-1.5 font-medium">Day</th>
            <th className="px-2 py-1.5 font-medium">Time</th>
            <th className="px-2 py-1.5 font-medium">Venue</th>
            <th className="px-2 py-1.5 font-medium">Course</th>
            <th className="px-2 py-1.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((tt) => (
            <tr
              key={tt.id}
              className="border-t border-slate-800/80 hover:bg-slate-950/40"
            >
              <td className="px-2 py-1.5 text-slate-100">
                <span className="font-medium">{tt.subject_code}</span>
                <span className="text-slate-500"> — </span>
                {tt.subject_name}
              </td>
              <td className="px-2 py-1.5 text-slate-300">
                {tt.lecturer_name ?? "—"}
              </td>
              <td className="px-2 py-1.5 text-slate-400 uppercase">
                {tt.day}
              </td>
              <td className="px-2 py-1.5 text-slate-400 whitespace-nowrap">
                {tt.start_time} – {tt.end_time}
              </td>
              <td className="px-2 py-1.5 text-slate-400">{tt.venue}</td>
              <td className="px-2 py-1.5 text-slate-500">{tt.course_name}</td>
              <td className="px-2 py-1.5 text-slate-500">{tt.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
