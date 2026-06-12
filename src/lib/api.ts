import { clearToken } from "@/lib/auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export type UserRole = "LECTURER" | "MONITOR" | "ADMIN";

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  registration_number: string | null;
  programme: number | null;
  programme_name: string | null;
}

export interface ProgrammeItem {
  id: number;
  name: string;
}

export interface CourseItem {
  id: number;
  code: string;
  name: string;
  programme: number | null;
  programme_name: string | null;
}

export interface SemesterItem {
  id: number;
  name: string;
  course: number;
  year_of_study: number | null;
  programme_name: string | null;
}

export interface YearOfStudyItem {
  id: number;
  name: string;
  programme: number | null;
  course: number;
  semester: number;
  programme_name: string | null;
}

export interface TaskSummary {
  id: number;
  title: string;
  type: string;
  class_name: string;
  scheduled_at: string | null;
  send_to_crs: boolean;
}

export interface TimetableItem {
  id: number;
  subject_code: string;
  subject_name: string;
  course_name: string;
  venue: string;
  day: string;
  start_time: string;
  end_time: string;
  status: string;
  color_code: string;
  lecturer_id?: number;
  lecturer_name?: string;
  monitor_id?: number;
  semester_id?: number;
  cancellation_note?: string | null;
}

export interface AdminUserDetail extends AdminUser {
  lecturer_timetables: TimetableItem[];
  monitor_timetables: TimetableItem[];
  tasks: TaskSummary[];
}

/** Admin list: class rep plus timetables they created */
export interface AdminMonitorWithTimetables extends AdminUser {
  monitor_timetables: TimetableItem[];
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  // Ensure trailing slash for Django
  let normalizedPath = path;
  if (path.includes("?")) {
    const [base, query] = path.split("?");
    if (!base.endsWith("/")) {
      normalizedPath = `${base}/?${query}`;
    }
  } else if (!path.endsWith("/")) {
    normalizedPath = `${path}/`;
  }

  const res = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) {
      let payload: { code?: string; detail?: string } | null = null;
      try {
        payload = JSON.parse(text) as { code?: string; detail?: string };
      } catch {
        // Fall through to generic error below if response is not JSON.
      }
      if (payload?.code === "token_not_valid") {
        clearToken();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please sign in again.");
      }
    }
    throw new Error(
      `API error ${res.status}: ${
        text || res.statusText || "Unknown error from backend"
      }`
    );
  }

  if (res.status === 204) {
    // No content
    return null as T;
  }

  return (await res.json()) as T;
}

