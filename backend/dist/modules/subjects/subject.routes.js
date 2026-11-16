import express from "express";
import { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject, patchLectures, patchSummaries, patchRecords, patchQuizzes, getSubjectProgress, toggleSubjectProgress, } from "./subject.controller.js";
import { verifyToken, verifyAdminToken, } from "../../middlewares/verifyToken.js";
import upload, { lectureUpload, documentUpload, audioUpload, } from "../../middlewares/multer.js";
const router = express.Router();
// Root route: GET (all students & admins) and POST (admin & superadmin only)
router
    .route("/")
    .get(verifyToken, getAllSubjects)
    .post(verifyAdminToken, upload.single("thumbnail"), createSubject);
// Progress routes (Students, Admins, Superadmins)
router.get("/:subjectId/progress", verifyToken, getSubjectProgress);
router.post("/:subjectId/progress/toggle", verifyToken, toggleSubjectProgress);
// Sub-resource routes (Supports both POST and PATCH for compatibility)
router
    .route("/:subjectId/lectures")
    .post(verifyAdminToken, lectureUpload.single("file"), patchLectures)
    .patch(verifyAdminToken, lectureUpload.single("file"), patchLectures);
router
    .route("/:subjectId/summaries")
    .post(verifyAdminToken, documentUpload.single("file"), patchSummaries)
    .patch(verifyAdminToken, documentUpload.single("file"), patchSummaries);
router
    .route("/:subjectId/records")
    .post(verifyAdminToken, audioUpload.single("file"), patchRecords)
    .patch(verifyAdminToken, audioUpload.single("file"), patchRecords);
// Also alias /audio to /records for audio uploads
router
    .route("/:subjectId/audio")
    .post(verifyAdminToken, audioUpload.single("file"), patchRecords)
    .patch(verifyAdminToken, audioUpload.single("file"), patchRecords);
router
    .route("/:subjectId/quizzes")
    .post(verifyAdminToken, patchQuizzes)
    .patch(verifyAdminToken, patchQuizzes);
// Individual subject routes
router
    .route("/:subjectId")
    .get(verifyToken, getSubjectById)
    .put(verifyAdminToken, upload.single("thumbnail"), updateSubject)
    .delete(verifyAdminToken, deleteSubject);
export default router;
//# sourceMappingURL=subject.routes.js.map