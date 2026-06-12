 "use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import {
  AdminUser,
  CourseItem,
  ProgrammeItem,
  SemesterItem,
  YearOfStudyItem,
  apiFetch,
} from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [years, setYears] = useState<YearOfStudyItem[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [usersData, programmesData, coursesData, semestersData, yearsData] =
          await Promise.all([
            apiFetch<AdminUser[]>("/admin/users", {}, token),
            apiFetch<ProgrammeItem[]>("/admin/programmes", {}, token),
            apiFetch<CourseItem[]>("/admin/courses", {}, token),
            apiFetch<SemesterItem[]>("/admin/semesters", {}, token),
            apiFetch<YearOfStudyItem[]>("/admin/years-of-study", {}, token),
          ]);
        setUsers(usersData);
        setProgrammes(programmesData);
        setCourses(coursesData);
        setSemesters(semestersData);
        setYears(yearsData);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }
    void loadDashboard();
  }, [router]);

  const lecturerCount = useMemo(
    () => users.filter((user) => user.role === "LECTURER").length,
    [users]
  );
  const crCount = useMemo(
    () => users.filter((user) => user.role === "MONITOR").length,
    [users]
  );
  const adminCount = useMemo(
    () => users.filter((user) => user.role === "ADMIN").length,
    [users]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Welcome, Admin
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Overview of academic setup and user distribution.
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Programmes" value={programmes.length} loading={loading} />
        <StatCard title="Courses" value={courses.length} loading={loading} />
        <StatCard title="Years of Study" value={years.length} loading={loading} />
        <StatCard title="Semesters" value={semesters.length} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Lecturers" value={lecturerCount} loading={loading} />
        <StatCard title="CRs" value={crCount} loading={loading} />
        <StatCard title="Admins" value={adminCount} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm font-medium text-slate-200">Programme Coverage</h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {programmes.length === 0 && <li>No programmes created yet.</li>}
            {programmes.map((programme) => {
              const courseCount = courses.filter((c) => c.programme === programme.id).length;
              return (
                <li key={programme.id} className="flex justify-between gap-2">
                  <span className="truncate">{programme.name}</span>
                  <span className="text-slate-400">{courseCount} course(s)</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm font-medium text-slate-200">Quick Actions</h3>
          <p className="mt-1 text-xs text-slate-400">
            Jump directly to key management sections.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/users" className="rounded border border-slate-700 px-2 py-1 text-slate-200">
              Manage Users
            </Link>
            <Link href="/academic" className="rounded border border-slate-700 px-2 py-1 text-slate-200">
              Academic Setup
            </Link>
            <Link href="/programmes" className="rounded border border-slate-700 px-2 py-1 text-slate-200">
              Programme Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
}: {
  title: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-slate-100">
        {loading ? "-" : value}
      </p>
    </div>
  );
}
