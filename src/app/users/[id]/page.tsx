"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AdminUser,
  AdminUserDetail,
  TimetableItem,
  TaskSummary,
  apiFetch,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number(params.id);

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [token, setTokenState] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

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
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<AdminUserDetail>(
          `/admin/users/${userId}`,
          {},
          token
        );
        setDetail(data);
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setEmail(data.email ?? "");
        setRegistrationNumber(data.registration_number ?? "");
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    if (!Number.isNaN(userId)) {
      void load();
    }
  }, [userId, token]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleting(true);
    try {
      await apiFetch<null>(`/admin/users/${userId}`, { method: "DELETE" }, token);
      router.push("/users");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, string | null> = {
        first_name: firstName,
        last_name: lastName,
        email,
      };
      if (detail?.role === "MONITOR") {
        payload.registration_number = registrationNumber;
      }
      const updated = await apiFetch<AdminUser>(
        `/admin/users/${userId}`,
        { method: "PUT", body: JSON.stringify(payload) },
        token
      );
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-xs text-slate-400">Loading user details...</p>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-red-400">
        {error}
      </p>
    );
  }

  if (!detail) {
    return (
      <p className="text-xs text-slate-400">User not found.</p>
    );
  }

  const fullName = `${detail.first_name} ${detail.last_name}`.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            {fullName || detail.email}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {detail.role === "MONITOR" ? "CR" : detail.role} • {detail.email}
            {detail.registration_number
              ? ` • ${detail.registration_number}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md border border-emerald-500/70 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md border border-red-500/70 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-slate-200">User Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs text-slate-300">
              First name
              <input
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-300">
              Last name
              <input
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-300 md:col-span-2">
              Email
              <input
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {detail.role === "MONITOR" && (
              <label className="text-xs text-slate-300 md:col-span-2">
                Registration number
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </label>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm font-medium text-slate-200 mb-2">
            Lecturer Timetables
          </h3>
          <TimetableList items={detail.lecturer_timetables} />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm font-medium text-slate-200 mb-2">
            CR Timetables
          </h3>
          <TimetableList items={detail.monitor_timetables} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-medium text-slate-200 mb-2">
          Tasks (Lecturer)
        </h3>
        <TaskList items={detail.tasks} />
      </section>
    </div>
  );
}

function TimetableList({ items }: { items: TimetableItem[] }) {
  if (!items.length) {
    return (
      <p className="text-xs text-slate-500">
        No timetables found for this user.
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-xs">
      {items.map((tt) => (
        <li
          key={tt.id}
          className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-100">
              {tt.subject_code} • {tt.subject_name}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">
              {tt.day}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {tt.start_time} – {tt.end_time}
            </span>
            <span>{tt.venue}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Status: {tt.status}
          </div>
        </li>
      ))}
    </ul>
  );
}

function TaskList({ items }: { items: TaskSummary[] }) {
  if (!items.length) {
    return (
      <p className="text-xs text-slate-500">
        No tasks found for this user.
      </p>
    );
  }
  return (
    <ul className="space-y-2 text-xs">
      {items.map((task) => (
        <li
          key={task.id}
          className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-100">{task.title}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">
              {task.type}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{task.class_name}</span>
            <span>{task.scheduled_at ?? "Unscheduled"}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}


