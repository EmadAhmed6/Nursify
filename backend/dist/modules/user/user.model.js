import jwt from "jsonwebtoken";
import { Document, Schema, model, Types } from "mongoose";
import { ChangePasswordSchema, ForgotPasswordSchema, LoginSchema, OtpSchema, RegisterSchema, ResetPasswordSchema, UpdateUserSchema, UserRoleSchema, UserProviderSchema, } from "./user.schema.js";
export { UserRoleSchema, UserProviderSchema };
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 4,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        },
        minLength: 6,
    },
    role: {
        type: String,
        enum: ["student", "admin", "superadmin", "Student", "Admin", "SuperAdmin"],
        set: (v) => (v ? v.toLowerCase() : "student"),
        default: "student",
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    jobTitle: {
        type: String,
        default: "Student",
        trim: true,
        maxLength: 50,
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 250,
    },
    subjectsCount: {
        type: Number,
        default: 0,
    },
    points: {
        type: Number,
        default: 0,
        min: 0,
    },
    otp: {
        type: String,
        default: null,
        select: false,
    },
    otpExpired: {
        type: Date,
        default: null,
        select: false,
    },
    profilePicture: {
        type: {
            url: String,
            publicId: { type: String, default: null },
        },
        default: {
            url: "",
            publicId: null,
        },
    },
    refreshToken: {
        type: String,
        select: false,
    },
    isVerified: { type: Boolean, default: false },
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    blockedByUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        getters: true,
    },
    toObject: { virtuals: true, getters: true },
});
userSchema.index({ points: -1, updatedAt: 1 });
userSchema.virtual("subjects", {
    ref: "Subject",
    foreignField: "createdBy",
    localField: "_id",
});
userSchema.methods.generateToken = function () {
    return jwt.sign({
        id: this._id,
        role: this.role,
        username: this.username,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "15m",
    });
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_KEY, {
        expiresIn: "7d",
    });
};
const validateRegisterUser = (user) => {
    return RegisterSchema.safeParse(user);
};
const validateLoginUser = (user) => {
    return LoginSchema.safeParse(user);
};
const validateForgotPassword = (email) => {
    return ForgotPasswordSchema.safeParse(email);
};
const validateResetPassword = (password) => {
    return ResetPasswordSchema.safeParse(password);
};
const validateChangePassword = (password) => {
    return ChangePasswordSchema.safeParse(password);
};
const validateVerifyOtp = (data) => {
    return OtpSchema.safeParse(data);
};
const validateUpdateUser = (user) => {
    return UpdateUserSchema.safeParse(user);
};
const User = model("User", userSchema);
export { User, validateRegisterUser, validateLoginUser, validateResetPassword, validateForgotPassword, validateChangePassword, validateVerifyOtp, validateUpdateUser, };
//# sourceMappingURL=user.model.js.map