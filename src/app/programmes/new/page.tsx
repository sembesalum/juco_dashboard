"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgrammeItem, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function NewProgrammePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch<ProgrammeItem>(
        "/admin/programmes",
        { method: "POST", body: JSON.stringify({ name }) },
        token
      );
      router.push("/academic");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create programme");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">Programme Creation</h2>
        <p className="mt-1 text-xs text-slate-400">
          Admin only registers the programme name. Class representatives set semester and year of study in the mobile app under Profile.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <label className="block text-xs text-slate-300">
          Programme name
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Programme"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/academic")}
            className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
