import asyncHandler from "express-async-handler";
import { Types } from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary.js";
import fs from "fs";
import { Subject } from "./subject.model.js";
import { User } from "../user/user.model.js";
import { UserProgress } from "./progress.model.js";
import { CreateSubjectSchema, UpdateSubjectSchema, CreateLectureSchema, CreateSummarySchema, CreateRecordSchema, CreateQuizSchema, } from "./subject.schema.js";
function toSingleId(param) {
    if (!param)
        return null;
    const id = Array.isArray(param) ? (param[0] ?? null) : param;
    if (!id)
        return null;
    return Types.ObjectId.isValid(id) ? id : null;
}
function handleServerError(res, error, defaultMessage, statusCode = 500) {
    console.error("Cloudinary/Server Error:", error);
    const isDev = process.env.NODE_ENV !== "production";
    return res.status(statusCode).json({
        success: false,
        message: error?.message || error?.error?.message || defaultMessage,
        ...(isDev && { stack: error?.stack }),
    });
}
// CREATE SUBJECT (Admin & SuperAdmin only)
export const createSubject = asyncHandler(async (req, res) => {
    let bodyData = req.body;
    if (typeof bodyData === "string") {
        try {
            bodyData = JSON.parse(bodyData);
        }
        catch {
            // keep as is
        }
    }
    const parseResult = CreateSubjectSchema.safeParse(bodyData);
    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            message: parseResult.error.issues[0]?.message ?? "Invalid input data",
            errors: parseResult.error.issues,
        });
        return;
    }
    let thumbnailUrl = "";
    let thumbnailPublicId = null;
    if (req.file) {
        const isImage = req.file.mimetype.startsWith("image/") ||
            /\.(jpe?g|png|webp|gif|svg)$/i.test(req.file.originalname);
        if (!isImage) {
            if (req.file.path && fs.existsSync(req.file.path))
                fs.unlinkSync(req.file.path);
            res.status(400).json({
                success: false,
                message: "Invalid file format for thumbnail. Only image files (JPEG, PNG, WEBP, etc.) are allowed.",
            });
            return;
        }
        try {
            const uploadRes = await uploadToCloudinary(req.file, "nursify/subjects", {
                resource_type: "image",
            });
            thumbnailUrl = uploadRes.secure_url;
            thumbnailPublicId = uploadRes.public_id;
        }
        catch (uploadErr) {
            handleServerError(res, uploadErr, "Failed to upload subject thumbnail to Cloudinary");
            return;
        }
        finally {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    }
    else if (parseResult.data.thumbnail?.url) {
        thumbnailUrl = parseResult.data.thumbnail.url;
        thumbnailPublicId = parseResult.data.thumbnail.publicId ?? null;
    }
    const { thumbnail: _thumb, ...subjectFields } = parseResult.data;
    const createdBy = req.user?.id;
    const subjectId = new Types.ObjectId();
    try {
        await Subject.create({
            _id: subjectId,
            ...subjectFields,
            thumbnail: { url: thumbnailUrl, publicId: thumbnailPublicId },
            createdBy,
            lectures: [],
            summaries: [],
            records: [],
            quizzes: [],
        });
        const populatedSubject = await Subject.findById(subjectId).populate("createdBy", "fullName username profilePicture role");
        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: populatedSubject,
        });
    }
    catch (dbErr) {
        handleServerError(res, dbErr, "Failed to create subject in database");
        return;
    }
});
// GET ALL SUBJECTS (Students, Admins, Superadmins)
export const getAllSubjects = asyncHandler(async (req, res) => {
    const { search, department } = req.query;
    const pageNumber = Math.max(1, Number(req.query.pageNumber) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 12);
    const query = {};
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
        ];
    }
    if (department && department !== "All") {
        query.department = { $regex: new RegExp(`^${department}$`, "i") };
    }
    const totalSubjects = await Subject.countDocuments(query);
    const subjects = await Subject.find(query)
        .skip((pageNumber - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("createdBy", "fullName username profilePicture role");
    res.status(200).json({
        success: true,
        message: "Subjects fetched successfully",
        data: {
            subjects,
            page: pageNumber,
            pages: Math.ceil(totalSubjects / limit),
            limit,
            totalSubjects,
        },
    });
});
// GET SUBJECT BY ID (Students, Admins, Superadmins)
export const getSubjectById = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    if (!subjectId) {
        res.status(400).json({ success: false, message: "Invalid Subject ID" });
        return;
    }
    const subject = await Subject.findById(subjectId).populate("createdBy", "fullName username profilePicture role");
    if (!subject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    res.status(200).json({
        success: true,
        message: "Subject fetched successfully",
        data: subject,
    });
});
// UPDATE SUBJECT (Admin & SuperAdmin only)
export const updateSubject = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    if (!subjectId) {
        res.status(400).json({ success: false, message: "Invalid Subject ID" });
        return;
    }
    let existingSubject;
    try {
        existingSubject = await Subject.findById(subjectId);
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving subject");
        return;
    }
    if (!existingSubject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    let bodyData = req.body;
    if (typeof bodyData === "string") {
        try {
            bodyData = JSON.parse(bodyData);
        }
        catch {
            // keep as is
        }
    }
    const parseResult = UpdateSubjectSchema.safeParse(bodyData);
    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            message: parseResult.error.issues[0]?.message ?? "Invalid input data",
            errors: parseResult.error.issues,
        });
        return;
    }
    let thumbnailUrl = existingSubject.thumbnail?.url ?? "";
    let thumbnailPublicId = existingSubject.thumbnail?.publicId ?? null;
    if (req.file) {
        const isImage = req.file.mimetype.startsWith("image/") ||
            /\.(jpe?g|png|webp|gif|svg)$/i.test(req.file.originalname);
        if (!isImage) {
            if (req.file.path && fs.existsSync(req.file.path))
                fs.unlinkSync(req.file.path);
            res.status(400).json({
                success: false,
                message: "Invalid file format for thumbnail. Only image files (JPEG, PNG, WEBP, etc.) are allowed.",
            });
            return;
        }
        try {
            if (thumbnailPublicId) {
                await deleteFromCloudinary(thumbnailPublicId);
            }
            const uploadRes = await uploadToCloudinary(req.file, "nursify/subjects", {
                resource_type: "image",
            });
            thumbnailUrl = uploadRes.secure_url;
            thumbnailPublicId = uploadRes.public_id;
        }
        catch (uploadErr) {
            handleServerError(res, uploadErr, "Failed to upload subject thumbnail to Cloudinary");
            return;
        }
        finally {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    }
    else if (parseResult.data.thumbnail?.url) {
        thumbnailUrl = parseResult.data.thumbnail.url;
        thumbnailPublicId = parseResult.data.thumbnail.publicId ?? null;
    }
    const { thumbnail: _thumb, ...subjectFields } = parseResult.data;
    try {
        const updated = await Subject.findByIdAndUpdate(subjectId, {
            $set: {
                ...subjectFields,
                thumbnail: { url: thumbnailUrl, publicId: thumbnailPublicId },
            },
        }, { returnDocument: "after", runValidators: true }).populate("createdBy", "fullName username profilePicture role");
        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: updated,
        });
    }
    catch (dbErr) {
        handleServerError(res, dbErr, "Failed to update subject in database");
        return;
    }
});
// DELETE SUBJECT (Admin & SuperAdmin only)
export const deleteSubject = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    if (!subjectId) {
        res.status(400).json({ success: false, message: "Invalid Subject ID" });
        return;
    }
    let subject;
    try {
        subject = await Subject.findById(subjectId);
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving subject");
        return;
    }
    if (!subject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    if (subject.thumbnail?.publicId) {
        await deleteFromCloudinary(subject.thumbnail.publicId);
    }
    try {
        await Subject.findByIdAndDelete(subjectId);
        await UserProgress.deleteMany({ subject: subjectId });
        res.status(200).json({ success: true, message: "Subject deleted successfully" });
    }
    catch (dbErr) {
        handleServerError(res, dbErr, "Failed to delete subject from database");
        return;
    }
});
// PATCH LECTURES: Add / Remove Lecture (Admin & Superadmin only)
export const patchLectures = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    if (!subjectId) {
        res.status(400).json({ success: false, message: "Invalid Subject ID" });
        return;
    }
    let subject;
    try {
        subject = await Subject.findById(subjectId);
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving subject");
        return;
    }
    if (!subject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    const { action = "add", lectureId, lecture } = req.body;
    if (action === "remove") {
        const targetId = toSingleId(lectureId ?? req.body._id);
        if (!targetId) {
            res.status(400).json({
                success: false,
                message: "Valid lectureId is required to remove a lecture",
            });
            return;
        }
        try {
            await Subject.findByIdAndUpdate(subjectId, { $pull: { lectures: { _id: new Types.ObjectId(targetId) } } }, { returnDocument: "after" });
            const updated = await Subject.findById(subjectId).populate("createdBy", "fullName username profilePicture role");
            res.status(200).json({
                success: true,
                message: "Lecture removed successfully",
                data: updated,
            });
            return;
        }
        catch (err) {
            handleServerError(res, err, "Failed to remove lecture from database");
            return;
        }
    }
    let lectureData = lecture ?? req.body;
    if (typeof lectureData === "string") {
        try {
            lectureData = JSON.parse(lectureData);
        }
        catch {
            // keep as is
        }
    }
    // Handle file upload if present (video or pdf)
    if (req.file) {
        const isVideo = req.file.mimetype.startsWith("video/") ||
            /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(req.file.originalname);
        const isPdf = req.file.mimetype === "application/pdf" ||
            req.file.mimetype.startsWith("application/") ||
            /\.(pdf|docx?|pptx?)$/i.test(req.file.originalname);
        if (!isVideo && !isPdf) {
            if (req.file.path && fs.existsSync(req.file.path))
                fs.unlinkSync(req.file.path);
            res.status(400).json({
                success: false,
                message: "Invalid file format for lecture. Please upload a video file (MP4, WEBM, MOV) or PDF document.",
            });
            return;
        }
        try {
            const uploadRes = await uploadToCloudinary(req.file, "nursify/lectures", {
                resource_type: isVideo ? "video" : "raw",
            });
            if (isVideo) {
                lectureData.videoUrl = uploadRes.secure_url;
            }
            else {
                lectureData.fileUrl = uploadRes.secure_url;
            }
        }
        catch (uploadErr) {
            handleServerError(res, uploadErr, "Failed to upload lecture file to Cloudinary");
            return;
        }
        finally {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    }
    else if (!lectureData.videoUrl && !lectureData.fileUrl) {
        res.status(400).json({
            success: false,
            message: "A lecture file (video/PDF) or a valid URL is required",
        });
        return;
    }
    const parseResult = CreateLectureSchema.safeParse(lectureData);
    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            message: parseResult.error.issues[0]?.message ?? "Invalid lecture data",
            errors: parseResult.error.issues,
        });
        return;
    }
    try {
        const updated = await Subject.findByIdAndUpdate(subjectId, { $push: { lectures: { ...parseResult.data, createdAt: new Date() } } }, { returnDocument: "after", runValidators: true }).populate("createdBy", "fullName username profilePicture role");
        res.status(200).json({
            success: true,
            message: "Lecture added successfully",
            data: updated,
        });
    }
    catch (dbErr) {
        handleServerError(res, dbErr, "Database error adding lecture");
        return;
    }
});
// PATCH SUMMARIES: Add / Remove Summary (Admin & Superadmin only)
export const patchSummaries = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    if (!subjectId) {
        res.status(400).json({ success: false, message: "Invalid Subject ID" });
        return;
    }
    let subject;
    try {
        subject = await Subject.findById(subjectId);
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving subject");
        return;
    }
    if (!subject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    const { action = "add", summaryId, summary } = req.body;
    if (action === "remove") {
        const targetId = toSingleId(summaryId ?? req.body._id);
        if (!targetId) {
            res.status(400).json({
                success: false,
                message: "Valid summaryId is required to remove a summary",
            });
            return;
        }
        try {
            await Subject.findByIdAndUpdate(subjectId, { $pull: { summaries: { _id: new Types.ObjectId(targetId) } } }, { returnDocument: "after" });
            const updated = await Subject.findById(subjectId).populate("createdBy", "fullName username profilePicture role");
            res.status(200).json({
                success: true,
                message: "Summary removed successfully",
                data: updated,
            });
            return;
        }
        catch (err) {
            handleServerError(res, err, "Failed to remove summary from database");
            return;
        }
    }
    let summaryData = summary ?? req.body;
    if (typeof summaryData === "string") {
        try {
            summaryData = JSON.parse(summaryData);
        }
        catch {
            // keep as is
        }
    }
    // Handle file upload if present (PDF/Document)
    if (req.file) {
        const isDocument = req.file.mimetype.startsWith("application/") ||
            req.file.mimetype.startsWith("text/") ||
            /\.(pdf|docx?|pptx?|txt)$/i.test(req.file.originalname);
        if (!isDocument) {
            if (req.file.path && fs.existsSync(req.file.path))
                fs.unlinkSync(req.file.path);
            res.status(400).json({
                success: false,
                message: "Invalid file format for summary. Only PDF and document files are accepted.",
            });
            return;
        }
        try {
            const uploadRes = await uploadToCloudinary(req.file, "nursify/summaries", {
                resource_type: "raw",
            });
            summaryData.fileUrl = uploadRes.secure_url;
        }
        catch (uploadErr) {
            handleServerError(res, uploadErr, "Failed to upload summary document to Cloudinary");
            return;
        }
        finally {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    }
    else if (!summaryData.fileUrl) {
        res.status(400).json({
            success: false,
            message: "A summary document file (PDF) or a valid URL is required",
        });
        return;
    }
    const parseResult = CreateSummarySchema.safeParse(summaryData);
    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            message: parseResult.error.issues[0]?.message ?? "Invalid summary data",
            errors: parseResult.error.issues,
        });
        return;
    }
    try {
        const updated = await Subject.findByIdAndUpdate(subjectId, { $push: { summaries: { ...parseResult.data, createdAt: new Date() } } }, { returnDocument: "after", runValidators: true }).populate("createdBy", "fullName username profilePicture role");
        res.status(200).json({
            success: true,
            message: "Summary added successfully",
            data: updated,
        });
    }
    catch (dbErr) {
        handleServerError(res, dbErr, "Database error adding summary");
        return;
    }
});
// PATCH RECORDS: Add / Remove Audio Record (Admin & Superadmin only)
export const patchRecords = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    if (!subjectId) {
        res.status(400).json({ success: false, message: "Invalid Subject ID" });
        return;
    }
    let subject;
    try {
        subject = await Subject.findById(subjectId);
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving subject");
        return;
    }
    if (!subject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    const { action = "add", recordId, record } = req.body;
    if (action === "remove") {
        const targetId = toSingleId(recordId ?? req.body._id);
        if (!targetId) {
            res.status(400).json({
                success: false,
                message: "Valid recordId is required to remove an audio record",
            });
            return;
        }
        try {
            await Subject.findByIdAndUpdate(subjectId, { $pull: { records: { _id: new Types.ObjectId(targetId) } } }, { returnDocument: "after" });
            const updated = await Subject.findById(subjectId).populate("createdBy", "fullName username profilePicture role");
            res.status(200).json({
                success: true,
                message: "Audio record removed successfully",
                data: updated,
            });
            return;
        }
        catch (err) {
            handleServerError(res, err, "Failed to remove audio record from database");
            return;
        }
    }
    let recordData = record ?? req.body;
    if (typeof recordData === "string") {
        try {
            recordData = JSON.parse(recordData);
        }
        catch {
            // keep as is
        }
    }
    // Handle file upload if present (Audio only)
    if (req.file) {
        const isAudio = req.file.mimetype.startsWith("audio/") ||
            /\.(mp3|wav|m4a|aac|ogg|flac|wma)$/i.test(req.file.originalname);
        if (!isAudio) {
            if (req.file.path && fs.existsSync(req.file.path))
                fs.unlinkSync(req.file.path);
            res.status(400).json({
                success: false,
                message: "Invalid file format for audio record. Only audio files (MP3, WAV, M4A, etc.) are allowed.",
            });
            return;
        }
        try {
            const uploadRes = await uploadToCloudinary(req.file, "nursify/records", {
                resource_type: "video", // Cloudinary treats audio as video resource type
            });
            recordData.audioUrl = uploadRes.secure_url;
            if (uploadRes.duration) {
                const minutes = Math.floor(uploadRes.duration / 60);
                const seconds = Math.floor(uploadRes.duration % 60);
                recordData.duration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            }
        }
        catch (uploadErr) {
            handleServerError(res, uploadErr, "Failed to upload audio record to Cloudinary");
            return;
        }
        finally {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    }
    else if (!recordData.audioUrl) {
        res.status(400).json({
            success: false,
            message: "An audio record file or valid URL is required",
        });
        return;
    }
    const parseResult = CreateRecordSchema.safeParse(recordData);
    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            message: parseResult.error.issues[0]?.message ?? "Invalid audio record data",
            errors: parseResult.error.issues,
        });
        return;
    }
    try {
        const updated = await Subject.findByIdAndUpdate(subjectId, { $push: { records: { ...parseResult.data, createdAt: new Date() } } }, { returnDocument: "after", runValidators: true }).populate("createdBy", "fullName username profilePicture role");
        res.status(200).json({
            success: true,
            message: "Audio record added successfully",
            data: updated,
        });
    }
    catch (dbErr) {
        handleServerError(res, dbErr, "Database error adding audio record");
        return;
    }
});
// PATCH QUIZZES: Add / Remove Quiz (Admin & Superadmin only)
export const patchQuizzes = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    if (!subjectId) {
        res.status(400).json({ success: false, message: "Invalid Subject ID" });
        return;
    }
    let subject;
    try {
        subject = await Subject.findById(subjectId);
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving subject");
        return;
    }
    if (!subject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    const { action = "add", quizId, quiz } = req.body;
    if (action === "remove") {
        const targetId = toSingleId(quizId ?? req.body._id);
        if (!targetId) {
            res.status(400).json({
                success: false,
                message: "Valid quizId is required to remove a quiz",
            });
            return;
        }
        try {
            await Subject.findByIdAndUpdate(subjectId, { $pull: { quizzes: { _id: new Types.ObjectId(targetId) } } }, { returnDocument: "after" });
            const updated = await Subject.findById(subjectId).populate("createdBy", "fullName username profilePicture role");
            res.status(200).json({
                success: true,
                message: "Quiz removed successfully",
                data: updated,
            });
            return;
        }
        catch (err) {
            handleServerError(res, err, "Failed to remove quiz from database");
            return;
        }
    }
    let quizData = quiz ?? req.body;
    if (typeof quizData === "string") {
        try {
            quizData = JSON.parse(quizData);
        }
        catch {
            // keep as is
        }
    }
    const parseResult = CreateQuizSchema.safeParse(quizData);
    if (!parseResult.success) {
        res.status(400).json({
            success: false,
            message: parseResult.error.issues[0]?.message ?? "Invalid quiz data",
            errors: parseResult.error.issues,
        });
        return;
    }
    try {
        const updated = await Subject.findByIdAndUpdate(subjectId, { $push: { quizzes: { ...parseResult.data, createdAt: new Date() } } }, { returnDocument: "after", runValidators: true }).populate("createdBy", "fullName username profilePicture role");
        res.status(200).json({
            success: true,
            message: "Quiz added successfully",
            data: updated,
        });
    }
    catch (dbErr) {
        handleServerError(res, dbErr, "Database error adding quiz");
        return;
    }
});
// ─── USER PROGRESS TRACKING ───────────────────────────────────
// GET USER PROGRESS FOR A SUBJECT
export const getSubjectProgress = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    const userId = req.user?.id;
    if (!subjectId || !userId) {
        res.status(400).json({ success: false, message: "Invalid parameters" });
        return;
    }
    try {
        let progress = await UserProgress.findOne({
            user: userId,
            subject: subjectId,
        });
        if (!progress) {
            progress = await UserProgress.create({
                user: userId,
                subject: subjectId,
                completedLectures: [],
                completedSummaries: [],
                completedRecords: [],
                completedQuizzes: [],
                percentage: 0,
            });
        }
        res.status(200).json({
            success: true,
            data: progress,
        });
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving user progress");
        return;
    }
});
// TOGGLE ITEM PROGRESS (Lecture, Summary, Record, or Quiz)
export const toggleSubjectProgress = asyncHandler(async (req, res) => {
    const subjectId = toSingleId(req.params.subjectId);
    const userId = req.user?.id;
    if (!subjectId || !userId) {
        res.status(400).json({ success: false, message: "Invalid parameters" });
        return;
    }
    let subject;
    try {
        subject = await Subject.findById(subjectId);
    }
    catch (err) {
        handleServerError(res, err, "Database error retrieving subject");
        return;
    }
    if (!subject) {
        res.status(404).json({ success: false, message: "Subject not found" });
        return;
    }
    const { type, itemId } = req.body;
    if (!type || !itemId || !Types.ObjectId.isValid(itemId)) {
        res.status(400).json({ success: false, message: "Valid type and itemId are required" });
        return;
    }
    try {
        let progress = await UserProgress.findOne({
            user: userId,
            subject: subjectId,
        });
        if (!progress) {
            progress = new UserProgress({
                user: userId,
                subject: subjectId,
                completedLectures: [],
                completedSummaries: [],
                completedRecords: [],
                completedQuizzes: [],
                percentage: 0,
            });
        }
        const objItemId = new Types.ObjectId(itemId);
        // Toggle based on type
        let targetArray;
        if (type === "lecture") {
            targetArray = progress.completedLectures;
        }
        else if (type === "summary") {
            targetArray = progress.completedSummaries;
        }
        else if (type === "record") {
            targetArray = progress.completedRecords;
        }
        else if (type === "quiz") {
            targetArray = progress.completedQuizzes;
        }
        else {
            res.status(400).json({ success: false, message: "Invalid type" });
            return;
        }
        const existingIndex = targetArray.findIndex((id) => id.toString() === itemId);
        if (existingIndex > -1) {
            targetArray.splice(existingIndex, 1);
        }
        else {
            targetArray.push(objItemId);
        }
        // Calculate percentage across all materials
        const totalItems = (subject.lectures?.length || 0) +
            (subject.summaries?.length || 0) +
            (subject.records?.length || 0) +
            (subject.quizzes?.length || 0);
        const completedCount = progress.completedLectures.length +
            progress.completedSummaries.length +
            progress.completedRecords.length +
            progress.completedQuizzes.length;
        progress.percentage = totalItems > 0 ? Math.min(100, Math.round((completedCount / totalItems) * 100)) : 0;
        await progress.save();
        // Atomically update user points: +10 for completing, -10 for uncompleting
        const pointsDelta = existingIndex > -1 ? -10 : 10;
        await User.findByIdAndUpdate(userId, { $inc: { points: pointsDelta } });
        res.status(200).json({
            success: true,
            message: "Progress updated successfully",
            data: progress,
        });
    }
    catch (err) {
        handleServerError(res, err, "Database error updating user progress");
        return;
    }
});
//# sourceMappingURL=subject.controller.js.map