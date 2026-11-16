import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { GlobalMessage } from "../modules/chat/chat.model.js";
let io = null;
export const initSocket = (httpServer, frontendUrl) => {
    io = new Server(httpServer, {
        cors: {
            origin: frontendUrl || "http://localhost:3000",
            credentials: true,
            methods: ["GET", "POST"],
        },
    });
    // Authentication Middleware for Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace("Bearer ", "");
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        try {
            const secret = process.env.JWT_SECRET_KEY;
            const decoded = jwt.verify(token, secret);
            socket.data.user = decoded;
            next();
        }
        catch (err) {
            return next(new Error("Authentication error: Invalid or expired token"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        // Join global chat room
        socket.join("global_chat");
        // Listen for client sending new message directly via websocket
        socket.on("send_message", async (data, callback) => {
            try {
                const content = (data?.content || "").trim();
                if (!content) {
                    callback?.({ success: false, error: "Content cannot be empty" });
                    return;
                }
                const newMessage = await GlobalMessage.create({
                    sender: user.id,
                    content,
                    replyTo: data.replyTo || null,
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
                // Broadcast to everyone in global_chat room (including sender)
                io?.to("global_chat").emit("new_message", populatedMessage);
                callback?.({ success: true, data: populatedMessage });
            }
            catch (error) {
                console.error("Socket send_message error:", error);
                callback?.({ success: false, error: error.message || "Failed to send message" });
            }
        });
        socket.on("disconnect", () => {
            // client disconnected
        });
    });
    return io;
};
export const getIO = () => {
    return io;
};
//# sourceMappingURL=socket.js.map