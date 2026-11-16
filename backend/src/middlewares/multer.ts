import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memoryStorage so file.buffer is directly available for Base64 Data URI upload
const storage = multer.memoryStorage();

// General upload (up to 100MB)
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Audio-only upload filter
export const audioUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files (MP3, WAV, M4A, etc.) are allowed for audio records!"));
    }
  },
});

// Document/PDF upload filter (Summaries)
export const documentUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.includes("document") ||
      file.mimetype.includes("word") ||
      /\.(pdf|doc|docx)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and document files (PDF, DOC, DOCX) are allowed for summaries!"));
    }
  },
});

// Lecture upload filter (Video or PDF)
export const lectureUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/pdf" ||
      /\.(mp4|webm|mov|mkv|pdf)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Video or PDF files are allowed for lectures!"));
    }
  },
});

export default upload;
