"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminUser, ProgrammeItem, UserRole, apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function NewUserPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("LECTURER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | undefined>(undefined);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, string> = {
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        password,
      };
      if (role === "MONITOR") {
        body.registration_number = registrationNumber;
        body.programme = programmeId;
      }
      const created = await apiFetch<AdminUser>(
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        token
      );
      router.push(`/users/${created.id}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setTokenState(stored);
    apiFetch<ProgrammeItem[]>("/admin/programmes", {}, stored)
      .then(setProgrammes)
      .catch(() => setProgrammes([]));
  }, [router]);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">New User</h2>
        <p className="mt-1 text-xs text-slate-400">
          Register a new lecturer, class representative, or admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-xs">
            <label className="block text-slate-300">First name</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="block text-slate-300">Last name</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-slate-300">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-xs">
            <label className="block text-slate-300">Role</label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="LECTURER">Lecturer</option>
              <option value="MONITOR">Class Representative</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {role === "MONITOR" && (
            <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
              <div className="space-y-1 text-xs">
                <label className="block text-slate-300">Registration number</label>
                <input
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required={role === "MONITOR"}
                />
              </div>
              <div className="space-y-1 text-xs">
                <label className="block text-slate-300">Programme</label>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  required={role === "MONITOR"}
                >
                  <option value="">Select programme</option>
                  {programmes.map((programme) => (
                    <option key={programme.id} value={String(programme.id)}>
                      {programme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-slate-300">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create user"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-900/80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

