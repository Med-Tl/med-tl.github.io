import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── USERS ────────────────────────────────────────────────────────────────────
export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllStudents = async () => {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const createProject = async (data, teacherId) => {
  const ref = await addDoc(collection(db, "projects"), {
    ...data,
    teacherId,
    status: "active",
    students: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getProjects = async (teacherId = null) => {
  const q = teacherId
    ? query(collection(db, "projects"), where("teacherId", "==", teacherId), orderBy("createdAt", "desc"))
    : query(collection(db, "projects"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getStudentProjects = async (studentId) => {
  const q = query(collection(db, "projects"), where("students", "array-contains", studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateProject = async (projectId, data) => {
  await updateDoc(doc(db, "projects", projectId), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, "projects", projectId));
};

export const assignStudentToProject = async (projectId, studentId) => {
  await updateDoc(doc(db, "projects", projectId), {
    students: arrayUnion(studentId),
  });
};

export const removeStudentFromProject = async (projectId, studentId) => {
  await updateDoc(doc(db, "projects", projectId), {
    students: arrayRemove(studentId),
  });
};

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const createTask = async (data) => {
  const ref = await addDoc(collection(db, "tasks"), {
    ...data,
    status: "pending",
    submissionCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getTasksByProject = async (projectId) => {
  const q = query(
    collection(db, "tasks"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllTasks = async () => {
  const snap = await getDocs(query(collection(db, "tasks"), orderBy("deadline", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateTask = async (taskId, data) => {
  await updateDoc(doc(db, "tasks", taskId), { ...data, updatedAt: serverTimestamp() });
};

export const deleteTask = async (taskId) => {
  await deleteDoc(doc(db, "tasks", taskId));
};

// ─── LABS ─────────────────────────────────────────────────────────────────────
export const createLab = async (data, teacherId) => {
  const ref = await addDoc(collection(db, "labs"), {
    ...data,
    teacherId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getLabs = async () => {
  const snap = await getDocs(query(collection(db, "labs"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteLab = async (labId) => {
  await deleteDoc(doc(db, "labs", labId));
};

// ─── RESOURCES ────────────────────────────────────────────────────────────────
export const createResource = async (data, uploadedBy) => {
  const ref = await addDoc(collection(db, "resources"), {
    ...data,
    uploadedBy,
    downloads: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getResources = async () => {
  const snap = await getDocs(query(collection(db, "resources"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const incrementDownload = async (resourceId) => {
  await updateDoc(doc(db, "resources", resourceId), { downloads: increment(1) });
};

export const deleteResource = async (resourceId) => {
  await deleteDoc(doc(db, "resources", resourceId));
};

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────
export const createSubmission = async (data) => {
  const ref = await addDoc(collection(db, "submissions"), {
    ...data,
    status: "pending",
    grade: null,
    feedback: "",
    submittedAt: serverTimestamp(),
  });
  // Increment task submission count
  await updateDoc(doc(db, "tasks", data.taskId), {
    submissionCount: increment(1),
  });
  return ref.id;
};

export const getSubmissionsByTask = async (taskId) => {
  const q = query(collection(db, "submissions"), where("taskId", "==", taskId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getSubmissionsByStudent = async (studentId) => {
  const q = query(
    collection(db, "submissions"),
    where("studentId", "==", studentId),
    orderBy("submittedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllSubmissions = async () => {
  const snap = await getDocs(query(collection(db, "submissions"), orderBy("submittedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const gradeSubmission = async (submissionId, { grade, feedback }) => {
  await updateDoc(doc(db, "submissions", submissionId), {
    grade,
    feedback,
    status: "graded",
    gradedAt: serverTimestamp(),
  });
};

export const checkExistingSubmission = async (taskId, studentId) => {
  const q = query(
    collection(db, "submissions"),
    where("taskId", "==", taskId),
    where("studentId", "==", studentId)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const createNotification = async (userId, { message, type }) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
};

export const getUserNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const markNotificationRead = async (notifId) => {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
};

export const markAllNotificationsRead = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getAnalyticsData = async () => {
  const [students, projects, tasks, submissions] = await Promise.all([
    getDocs(query(collection(db, "users"), where("role", "==", "student"))),
    getDocs(collection(db, "projects")),
    getDocs(collection(db, "tasks")),
    getDocs(collection(db, "submissions")),
  ]);

  const allSubs = submissions.docs.map((d) => ({ id: d.id, ...d.data() }));
  const now = new Date();

  const late = allSubs.filter((s) => {
    // Would need deadline from task - simplified here
    return s.status === "late";
  }).length;

  const grades = allSubs.filter((s) => s.grade !== null).map((s) => s.grade);
  const avgGrade = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : 0;

  return {
    totalStudents: students.size,
    totalProjects: projects.size,
    totalTasks: tasks.size,
    totalSubmissions: submissions.size,
    lateSubmissions: late,
    avgGrade,
    gradedSubmissions: allSubs.filter((s) => s.status === "graded").length,
  };
};
