import asyncHandler from "express-async-handler";
import { GlobalMessage } from "./chat.model.js";
import { getIO } from "../../config/socket.js";
// GET RECENT PUBLIC MESSAGES
export const getMessages = asyncHandler(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const before = req.query.before;
    const query = {};
    if (before && !isNaN(Date.parse(before))) {
        query.createdAt = { $lt: new Date(before) };
    }
    const messages = await GlobalMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("sender", "_id fullName username profilePicture role")
        .populate({
        path: "replyTo",
        select: "_id sender content createdAt",
        populate: {
            path: "sender",
            select: "_id fullName username profilePicture role",
        },
    });
    // Return chronological order (oldest to newest)
    const ordered = messages.reverse();
    res.status(200).json({
        success: true,
        message: "Messages fetched successfully",
        data: ordered,
    });
});
// SEND NEW PUBLIC MESSAGE
export const sendMessage = asyncHandler(async (req, res) => {
    const senderId = req.user?.id;
    if (!senderId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const content = (req.body.content || req.body.message || "").trim();
    if (!content) {
        res.status(400).json({
            success: false,
            message: "Message content cannot be empty",
        });
        return;
    }
    const replyTo = req.body.replyTo || null;
    const newMessage = await GlobalMessage.create({
        sender: senderId,
        content,
        replyTo: replyTo || null,
    });
    const populatedMessage = await GlobalMessage.findById(newMessage._id)
        .populate("sender", "_id fullName username profilePicture role")
        .populate({
        path: "replyTo",
        select: "_id sender content createdAt",
        populate: {
            path: "sender",
            select: "_id fullName username profilePicture role",
        },
    });
    // Broadcast in real-time via WebSocket
    const io = getIO();
    if (io) {
        io.to("global_chat").emit("new_message", populatedMessage);
    }
    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: populatedMessage,
    });
});
//# sourceMappingURL=chat.controller.js.map