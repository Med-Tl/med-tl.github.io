import { useState, useEffect, useCallback } from "react";
import {
  getProjects,
  getStudentProjects,
  getAllTasks,
  getTasksByProject,
  getLabs,
  getResources,
  getAllSubmissions,
  getSubmissionsByStudent,
  getUserNotifications,
  getAnalyticsData,
  getAllStudents,
} from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";

// Generic async loader hook
function useAsyncData(fetchFn, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load, setData };
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export function useProjects() {
  const { profile, isAdmin } = useAuth();

  return useAsyncData(
    () => isAdmin
      ? getProjects(profile?.id)
      : getStudentProjects(profile?.id),
    [profile?.id, isAdmin]
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
export function useTasks(projectId = null) {
  return useAsyncData(
    () => projectId ? getTasksByProject(projectId) : getAllTasks(),
    [projectId]
  );
}

// ─── LABS ─────────────────────────────────────────────────────────────────────
export function useLabs() {
  return useAsyncData(getLabs, []);
}

// ─── RESOURCES ────────────────────────────────────────────────────────────────
export function useResources() {
  return useAsyncData(getResources, []);
}

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────
export function useSubmissions() {
  const { profile, isAdmin } = useAuth();

  return useAsyncData(
    () => isAdmin
      ? getAllSubmissions()
      : getSubmissionsByStudent(profile?.id),
    [profile?.id, isAdmin]
  );
}

// ─── NOTIFICATIONS (real-time) ────────────────────────────────────────────────
export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    setLoading(true);
    const unsub = getUserNotifications(profile.id, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return unsub;
  }, [profile?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount };
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
export function useStudents() {
  return useAsyncData(getAllStudents, []);
}
