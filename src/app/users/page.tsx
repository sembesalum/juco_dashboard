"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminUser, API_BASE_URL, apiFetch, UserRole } from "@/lib/api";
import { getToken } from "@/lib/auth";

type FilterRole = UserRole | "ALL";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<FilterRole>("ALL");
  const [token, setTokenState] = useState<string | undefined>(undefined);

  async function loadUsers(role?: UserRole) {
    setLoading(true);
    setError(null);
    try {
      const query = role ? `?role=${role}` : "";
      const data = await apiFetch<AdminUser[]>(`/admin/users${query}`, {}, token);
      setUsers(data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

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
    if (filterRole === "ALL") {
      void loadUsers();
    } else {
      void loadUsers(filterRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Users</h2>
          <p className="mt-1 text-xs text-slate-400">
            View and manage all lecturers, class representatives and admins.
          </p>
        </div>
        <Link
          href="/users/new"
          className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400"
        >
          + New user
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Filter by role:</span>
          <select
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as FilterRole)}
          >
            <option value="ALL">All</option>
            <option value="LECTURER">Lecturer</option>
            <option value="MONITOR">Class Rep</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="text-[10px] text-slate-500">
          Backend: {API_BASE_URL.replace(/^https?:\/\//, "")}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Reg. No</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-xs text-slate-400"
                >
                  Loading users...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-xs text-red-400"
                >
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-xs text-slate-400"
                >
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-slate-800 hover:bg-slate-900/80"
                >
                  <td className="px-3 py-2 text-slate-100">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-3 py-2 text-slate-300">{user.email}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {user.registration_number ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      href={`/users/${user.id}`}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

