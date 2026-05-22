"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CourseItem,
  ProgrammeItem,
  SemesterItem,
  YearOfStudyItem,
  apiFetch,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function ProgrammesPage() {
  const router = useRouter();
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [years, setYears] = useState<YearOfStudyItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load(token: string) {
    try {
      setError(null);
      const [programmeData, courseData, semesterData, yearData] = await Promise.all([
        apiFetch<ProgrammeItem[]>("/admin/programmes", {}, token),
        apiFetch<CourseItem[]>("/admin/courses", {}, token),
        apiFetch<SemesterItem[]>("/admin/semesters", {}, token),
        apiFetch<YearOfStudyItem[]>("/admin/years-of-study", {}, token),
      ]);
      setProgrammes(programmeData);
      setCourses(courseData);
      setSemesters(semesterData);
      setYears(yearData);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load programmes");
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    void load(token);
  }, [router]);

  async function handleUpdate(item: ProgrammeItem) {
    const token = getToken();
    if (!token) return;
    const name = prompt("Update programme name", item.name);
    if (!name) return;
    await apiFetch<ProgrammeItem>(
      `/admin/programmes/${item.id}`,
      { method: "PUT", body: JSON.stringify({ name }) },
      token
    );
    await load(token);
  }

  async function handleDelete(item: ProgrammeItem) {
    const token = getToken();
    if (!token) return;
    if (!confirm(`Delete programme ${item.name}?`)) return;
    await apiFetch<null>(`/admin/programmes/${item.id}`, { method: "DELETE" }, token);
    await load(token);
  }

  async function handleUpdateCourse(item: CourseItem) {
    const token = getToken();
    if (!token) return;
    const name = prompt("Update course name", item.name);
    if (!name) return;
    await apiFetch<CourseItem>(
      `/admin/courses/${item.id}`,
      { method: "PUT", body: JSON.stringify({ name }) },
      token
    );
    await load(token);
  }

  async function handleDeleteCourse(item: CourseItem) {
    const token = getToken();
    if (!token) return;
    if (!confirm(`Delete course ${item.code} - ${item.name}?`)) return;
    await apiFetch<null>(`/admin/courses/${item.id}`, { method: "DELETE" }, token);
    await load(token);
  }

  async function handleUpdateSemester(item: SemesterItem) {
    const token = getToken();
    if (!token) return;
    const name = prompt("Update semester name", item.name);
    if (!name) return;
    await apiFetch<SemesterItem>(
      `/admin/semesters/${item.id}`,
      { method: "PUT", body: JSON.stringify({ name }) },
      token
    );
    await load(token);
  }

  async function handleDeleteSemester(item: SemesterItem) {
    const token = getToken();
    if (!token) return;
    if (!confirm(`Delete semester ${item.name}?`)) return;
    await apiFetch<null>(`/admin/semesters/${item.id}`, { method: "DELETE" }, token);
    await load(token);
  }

  async function handleUpdateYear(item: YearOfStudyItem) {
    const token = getToken();
    if (!token) return;
    const name = prompt("Update year of study name", item.name);
    if (!name) return;
    await apiFetch<YearOfStudyItem>(
      `/admin/years-of-study/${item.id}`,
      { method: "PUT", body: JSON.stringify({ name }) },
      token
    );
    await load(token);
  }

  async function handleDeleteYear(item: YearOfStudyItem) {
    const token = getToken();
    if (!token) return;
    if (!confirm(`Delete year of study ${item.name}?`)) return;
    await apiFetch<null>(`/admin/years-of-study/${item.id}`, { method: "DELETE" }, token);
    await load(token);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">Programme View</h2>
        <p className="mt-1 text-xs text-slate-400">
          View, update, and delete registered programmes.
        </p>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="space-y-3">
        {programmes.map((item) => {
          const programmeCourses = courses.filter((course) => course.programme === item.id);
          const courseIds = new Set(programmeCourses.map((course) => course.id));
          const programmeSemesters = semesters.filter((semester) =>
            courseIds.has(semester.course)
          );
          const programmeYears = years.filter((year) => year.programme === item.id);

          return (
            <section
              key={item.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-3 text-xs"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-slate-100">{item.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(item)}
                    className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
                  >
                    Update Programme
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded border border-red-500/60 px-2 py-1 text-[11px] text-red-300"
                  >
                    Delete Programme
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <EditableGroup
                  title="Courses"
                  items={programmeCourses.map((course) => ({
                    id: course.id,
                    label: `${course.code} - ${course.name}`,
                    onUpdate: () => handleUpdateCourse(course),
                    onDelete: () => handleDeleteCourse(course),
                  }))}
                />
                <EditableGroup
                  title="Years of Study"
                  items={programmeYears.map((year) => ({
                    id: year.id,
                    label: year.name,
                    onUpdate: () => handleUpdateYear(year),
                    onDelete: () => handleDeleteYear(year),
                  }))}
                />
                <EditableGroup
                  title="Semesters"
                  items={programmeSemesters.map((semester) => ({
                    id: semester.id,
                    label: semester.name,
                    onUpdate: () => handleUpdateSemester(semester),
                    onDelete: () => handleDeleteSemester(semester),
                  }))}
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function EditableGroup({
  title,
  items,
}: {
  title: string;
  items: { id: number; label: string; onUpdate: () => void; onDelete: () => void }[];
}) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950/40 p-2">
      <h3 className="mb-2 text-[11px] font-medium text-slate-300">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[11px] text-slate-500">None</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded border border-slate-800 px-2 py-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] text-slate-200">{item.label}</span>
                <div className="flex gap-1">
                  <button
                    onClick={item.onUpdate}
                    className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-200"
                  >
                    Update
                  </button>
                  <button
                    onClick={item.onDelete}
                    className="rounded border border-red-500/60 px-1.5 py-0.5 text-[10px] text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
