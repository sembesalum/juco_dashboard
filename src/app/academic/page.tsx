"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CourseItem,
  ProgrammeItem,
  SemesterItem,
  YearOfStudyItem,
  apiFetch,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AcademicPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [years, setYears] = useState<YearOfStudyItem[]>([]);

  async function loadAll(activeToken: string) {
    try {
      setError(null);
      const [programmesData, coursesData, semestersData, yearsData] = await Promise.all([
        apiFetch<ProgrammeItem[]>("/admin/programmes", {}, activeToken),
        apiFetch<CourseItem[]>("/admin/courses", {}, activeToken),
        apiFetch<SemesterItem[]>("/admin/semesters", {}, activeToken),
        apiFetch<YearOfStudyItem[]>("/admin/years-of-study", {}, activeToken),
      ]);
      setProgrammes(programmesData);
      setCourses(coursesData);
      setSemesters(semestersData);
      setYears(yearsData);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load academic setup");
    }
  }

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll(stored);
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-50">Academic Setup</h2>
        <div className="flex gap-2">
          <Link
            href="/programmes"
            className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
          >
            Manage Details
          </Link>
          <Link
            href="/programmes/new"
            className="rounded bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950"
          >
            + Create New Programme
          </Link>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}

      {programmes.length === 0 ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs text-slate-400">No programmes created yet.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {programmes.map((programme) => {
            const programmeCourses = courses.filter((c) => c.programme === programme.id);
            const programmeYears = years.filter((y) => y.programme === programme.id);
            const programmeCourseIds = new Set(programmeCourses.map((c) => c.id));
            const programmeSemesters = semesters.filter((s) =>
              programmeCourseIds.has(s.course)
            );

            return (
              <section
                key={programme.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <h3 className="text-sm font-medium text-slate-100">{programme.name}</h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  {programmeCourses.length} course(s) • {programmeYears.length} year(s) •{" "}
                  {programmeSemesters.length} semester(s)
                </p>

                <div className="mt-3 grid gap-3 md:grid-cols-3 text-xs">
                  <DetailList
                    title="Courses"
                    items={programmeCourses.map((c) => `${c.code} - ${c.name}`)}
                  />
                  <DetailList
                    title="Years of Study"
                    items={programmeYears.map((y) => y.name)}
                  />
                  <DetailList
                    title="Semesters"
                    items={programmeSemesters.map((s) => s.name)}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <h4 className="mb-2 text-xs font-medium text-slate-200">{title}</h4>
      {items.length === 0 ? (
        <p className="text-[11px] text-slate-500">None</p>
      ) : (
        <ul className="space-y-1 text-[11px] text-slate-300">
          {items.map((item) => (
            <li key={item} className="truncate">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
