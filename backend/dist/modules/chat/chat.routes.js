import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { getMessages, sendMessage } from "./chat.controller.js";
const router = express.Router();
// Public Global Chat Room Endpoints
router
    .route("/messages")
    .get(verifyToken, getMessages)
    .post(verifyToken, sendMessage);
export default router;
//# sourceMappingURL=chat.routes.js.map