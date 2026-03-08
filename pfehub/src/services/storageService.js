import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "../firebase";

/**
 * Upload a file to Firebase Storage with progress tracking.
 * @param {File} file - The file to upload
 * @param {string} path - Storage path e.g. "submissions/uid/filename"
 * @param {function} onProgress - Called with 0-100 progress value
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = (file, path, onProgress = () => {}) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress(pct);
      },
      (error) => {
        console.error("Upload error:", error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

/**
 * Upload a submission file (PDF or ZIP)
 */
export const uploadSubmissionFile = (file, studentId, taskId, onProgress) => {
  const ext = file.name.split(".").pop();
  const path = `submissions/${studentId}/${taskId}_${Date.now()}.${ext}`;
  return uploadFile(file, path, onProgress);
};

/**
 * Upload a resource file (teacher)
 */
export const uploadResourceFile = (file, teacherId, onProgress) => {
  const ext = file.name.split(".").pop();
  const path = `resources/${teacherId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

/**
 * Upload a task attachment
 */
export const uploadTaskFile = (file, taskId, onProgress) => {
  const path = `tasks/${taskId}/${file.name}`;
  return uploadFile(file, path, onProgress);
};

/**
 * Upload a lab submission (screenshot, PDF)
 */
export const uploadLabSubmission = (file, studentId, labId, onProgress) => {
  const ext = file.name.split(".").pop();
  const path = `lab-submissions/${labId}/${studentId}_${Date.now()}.${ext}`;
  return uploadFile(file, path, onProgress);
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (fileUrl) => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (err) {
    console.error("Delete file error:", err);
  }
};

/**
 * Get human-readable file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

/**
 * Validate file type and size
 */
export const validateFile = (file, { maxMB = 50, allowedTypes = [] } = {}) => {
  const errors = [];
  if (file.size > maxMB * 1024 * 1024) {
    errors.push(`File too large. Max size is ${maxMB}MB.`);
  }
  if (allowedTypes.length > 0) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      errors.push(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
    }
  }
  return errors;
};
