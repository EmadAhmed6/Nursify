import jwt from "jsonwebtoken";
import { Types } from "mongoose";
const verifyToken = (req, res, next) => {
    let token = req.headers.authorization;
    const secret = process.env.JWT_SECRET_KEY;
    if (typeof secret !== "string" || secret.length === 0) {
        return res.status(500).json({ message: "JWT secret is not configured" });
    }
    if (typeof token !== "string" || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        token = token.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
const verifyRefreshToken = (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    const secret = process.env.JWT_REFRESH_KEY;
    if (typeof secret !== "string" || secret.length === 0) {
        return res
            .status(500)
            .json({ message: "Refresh secret is not configured" });
    }
    if (!refreshToken) {
        return res
            .status(401)
            .json({ message: "No refresh token was found in cookies" });
    }
    try {
        const decoded = jwt.verify(refreshToken, secret);
        req.user = { id: decoded.id, role: decoded.role || "student" };
        next();
    }
    catch (err) {
        return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
    }
};
/**
 * Generic RBAC middleware to restrict access to specific user roles
 * Example: router.post('/', verifyToken, restrictTo('admin', 'superadmin'), controller)
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userRole = (req.user.role || "").toLowerCase();
        const allowed = roles.map((r) => r.toLowerCase());
        if (!allowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
                data: { message: "You do not have permission to perform this action" },
            });
        }
        next();
    };
};
const authorize = restrictTo;
const verifyAuthorizedToken = (req, res, next) => {
    verifyToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.params.userId;
        if (userId &&
            (typeof userId !== "string" || !Types.ObjectId.isValid(userId))) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const userRole = (req.user.role || "").toLowerCase();
        if (req.user.id === userId ||
            userRole === "admin" ||
            userRole === "superadmin") {
            next();
        }
        else {
            return res.status(403).json({ message: "You are not allowed" });
        }
    });
};
const verifyAdminToken = async (req, res, next) => {
    verifyToken(req, res, async () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let userRole = (req.user.role || "").toLowerCase();
        // Fallback: if token has outdated role (e.g. user was promoted without re-login), check DB directly
        if (userRole !== "admin" && userRole !== "superadmin") {
            try {
                const { User } = await import("../modules/user/user.model.js");
                const freshUser = await User.findById(req.user.id).select("role");
                if (freshUser && freshUser.role) {
                    userRole = freshUser.role.toLowerCase();
                    req.user.role = userRole;
                }
            }
            catch (err) {
                // continue with existing role check
            }
        }
        if (userRole === "admin" || userRole === "superadmin") {
            next();
        }
        else {
            return res
                .status(403)
                .json({ message: "You are not allowed, only admin allowed" });
        }
    });
};
const verifySuperAdminToken = (req, res, next) => {
    verifyToken(req, res, async () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let userRole = (req.user.role || "").toLowerCase();
        if (userRole !== "superadmin") {
            try {
                const { User } = await import("../modules/user/user.model.js");
                const freshUser = await User.findById(req.user.id).select("role");
                if (freshUser && freshUser.role) {
                    userRole = freshUser.role.toLowerCase();
                    req.user.role = userRole;
                }
            }
            catch (err) {
                // continue
            }
        }
        if (userRole === "superadmin") {
            next();
        }
        else {
            return res
                .status(403)
                .json({ message: "You are not allowed, only superadmin allowed" });
        }
    });
};
export { verifyToken, verifyRefreshToken, restrictTo, authorize, verifyAuthorizedToken, verifyAdminToken, verifySuperAdminToken, };
//# sourceMappingURL=verifyToken.js.map