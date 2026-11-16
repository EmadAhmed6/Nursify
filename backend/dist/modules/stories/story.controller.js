import { unlink } from "node:fs/promises";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { sendError, successMsg } from "../../middlewares/errors.js";
import { User } from "../user/user.model.js";
import { Story } from "./story.model.js";
const storyPopulation = [
    { path: "author", select: "_id username fullName profilePicture" },
    { path: "reactions.user", select: "_id username fullName profilePicture" },
];
const storyCutoff = () => new Date(Date.now() - 24 * 60 * 60 * 1000);
// GET ALL STORIES
const getAllStories = asyncHandler(async (_req, res) => {
    const stories = await Story.find({ createdAt: { $gte: storyCutoff() } })
        .sort({ createdAt: -1 })
        .populate(storyPopulation);
    successMsg(res, 200, "Stories fetched successfully", stories);
});
// GET TIMELINE STORIES
const getTimelineStories = asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
        sendError(res, 401, "You are not authorized");
        return;
    }
    const currentUser = await User.findById(currentUserId).select("following");
    if (!currentUser) {
        sendError(res, 404, "User was not found");
        return;
    }
    const authorIds = [
        ...currentUser.following.map((id) => id.toString()),
        currentUserId.toString(),
    ];
    const stories = await Story.find({
        author: { $in: authorIds },
        createdAt: { $gte: storyCutoff() },
    })
        .sort({ createdAt: 1 })
        .populate(storyPopulation);
    const groups = new Map();
    for (const story of stories) {
        const author = story.author;
        if (!author?._id)
            continue;
        const authorId = author._id.toString();
        const group = groups.get(authorId);
        if (group) {
            group.stories.push(story);
        }
        else {
            groups.set(authorId, { author: story.author, stories: [story] });
        }
    }
    successMsg(res, 200, "Timeline stories fetched successfully", Array.from(groups.values()));
});
const getUserStories = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        sendError(res, 400, "User ID is invalid");
        return;
    }
    const currentUserId = req.user?.id;
    const [targetUser, currentUser] = await Promise.all([
        User.findById(userId).select("blockUsers"),
        currentUserId && currentUserId !== userId
            ? User.findById(currentUserId).select("blockUsers")
            : null,
    ]);
    if (!targetUser) {
        sendError(res, 404, "User was not found");
        return;
    }
    const targetBlocksViewer = targetUser.blockUsers.some((id) => id.toString() === currentUserId);
    const viewerBlocksTarget = currentUser?.blockUsers.some((id) => id.toString() === userId);
    if (targetBlocksViewer || viewerBlocksTarget) {
        sendError(res, 403, "You cannot access this user's stories");
        return;
    }
    const stories = await Story.find({
        author: userId,
        createdAt: { $gte: storyCutoff() },
    })
        .sort({ createdAt: 1 })
        .populate(storyPopulation);
    successMsg(res, 200, "User stories fetched successfully", stories);
});
// CREATE STORY
const createStory = asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id;
    const file = req.file;
    if (!currentUserId) {
        sendError(res, 401, "You are not authorized");
        return;
    }
    const titleInput = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!file && !titleInput) {
        sendError(res, 400, "A story title or image/video is required");
        return;
    }
    const isImage = Boolean(file?.mimetype.startsWith("image/"));
    const isVideo = Boolean(file?.mimetype.startsWith("video/"));
    if (file && !isImage && !isVideo) {
        await unlink(file.path).catch(() => undefined);
        sendError(res, 400, "Only image and video stories are supported");
        return;
    }
    const title = (titleInput || "Story").slice(0, 250);
    try {
        const uploaded = file
            ? await uploadToCloudinary(file, "nursify/stories", {
                resource_type: isVideo ? "video" : "image",
            })
            : null;
        const story = await Story.create({
            author: currentUserId,
            title,
            imageUrl: uploaded && isImage ? uploaded.secure_url : "",
            fileUrl: uploaded && isVideo ? uploaded.secure_url : "",
            fileName: file && isVideo ? file.originalname : "",
        });
        await story.populate(storyPopulation);
        successMsg(res, 201, "Story created successfully", story);
    }
    catch (error) {
        console.error("Cloudinary/Server Error:", error);
        sendError(res, 500, error.message || "Failed to process story upload");
        return;
    }
    finally {
        if (file)
            await unlink(file.path).catch(() => undefined);
    }
});
// DELETE STORY
const deleteStory = asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id;
    const storyId = req.params.storyId;
    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
        sendError(res, 400, "Story ID is required");
        return;
    }
    const story = await Story.findById(storyId);
    if (!story) {
        sendError(res, 404, "Story was not found");
        return;
    }
    if (story.author.toString() !== currentUserId) {
        sendError(res, 403, "You are not authorized to delete this story");
        return;
    }
    await Story.findByIdAndDelete(storyId);
    successMsg(res, 200, "Story deleted successfully", null);
});
// VIEW STORY
const viewStory = asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id;
    const storyId = req.params.storyId;
    if (!currentUserId) {
        sendError(res, 401, "You are not authorized");
        return;
    }
    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
        sendError(res, 400, "Story ID is required");
        return;
    }
    let story = await Story.findById(storyId);
    if (!story) {
        sendError(res, 404, "Story was not found");
        return;
    }
    if (story.author.toString() !== currentUserId) {
        story = await Story.findByIdAndUpdate(storyId, { $addToSet: { views: currentUserId } }, { new: true }).populate(storyPopulation);
    }
    else {
        story = await Story.findByIdAndUpdate(storyId, { $set: { authorViewed: true } }, { new: true }).populate(storyPopulation);
    }
    if (!story) {
        sendError(res, 404, "Story was not found");
        return;
    }
    successMsg(res, 200, "Story viewed successfully", story);
});
// GET VIEWERS
const getViewers = asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id;
    const storyId = req.params.storyId;
    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
        sendError(res, 400, "Story ID is required");
        return;
    }
    const story = await Story.findById(storyId).populate("views", "_id username fullName profilePicture");
    if (!story) {
        sendError(res, 404, "Story was not found");
        return;
    }
    if (story.author.toString() !== currentUserId) {
        sendError(res, 403, "You are not authorized to view this story's viewers");
        return;
    }
    const authorId = story.author.toString();
    const viewers = story.views.filter((viewer) => {
        const populatedViewer = viewer;
        return (populatedViewer._id || viewer).toString() !== authorId;
    });
    successMsg(res, 200, "Viewers fetched successfully", viewers);
});
// REACT TO STORY
const reactToStory = asyncHandler(async (req, res) => {
    const storyId = req.params.storyId;
    const currentUserId = req.user?.id;
    const type = typeof req.body.type === "string" ? req.body.type.trim() : "";
    if (!storyId ||
        !mongoose.Types.ObjectId.isValid(storyId) ||
        !currentUserId ||
        !type) {
        sendError(res, 400, "Story ID and reaction type are required");
        return;
    }
    const story = await Story.findById(storyId);
    if (!story) {
        sendError(res, 404, "Story was not found");
        return;
    }
    const existingIndex = story.reactions.findIndex((reaction) => reaction.user.toString() === currentUserId);
    if (existingIndex >= 0) {
        if (story.reactions[existingIndex]?.type === type) {
            story.reactions.splice(existingIndex, 1);
        }
        else if (story.reactions[existingIndex]) {
            story.reactions[existingIndex].type = type;
        }
    }
    else {
        story.reactions.push({
            user: new mongoose.Types.ObjectId(currentUserId),
            type,
        });
    }
    await story.save();
    await story.populate(storyPopulation);
    successMsg(res, 200, "Story reaction updated successfully", story);
});
// REPLY TO STORY
const replyToStory = asyncHandler(async (req, res) => {
    const storyId = req.params.storyId;
    const currentUserId = req.user?.id;
    const message = req.body.message;
    if (!storyId ||
        !mongoose.Types.ObjectId.isValid(storyId) ||
        !currentUserId ||
        !message) {
        sendError(res, 400, "Story ID and message are required");
        return;
    }
    const story = await Story.findById(storyId);
    if (!story) {
        sendError(res, 404, "Story was not found");
        return;
    }
    story.replies.push({
        user: new mongoose.Types.ObjectId(currentUserId),
        message,
    });
    await story.save();
    await story.populate(storyPopulation);
    successMsg(res, 200, "Story replied successfully", story);
});
export { createStory, deleteStory, getAllStories, getTimelineStories, getUserStories, reactToStory, viewStory, getViewers, replyToStory, };
//# sourceMappingURL=story.controller.js.map