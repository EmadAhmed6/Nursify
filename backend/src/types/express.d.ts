import type { UserRole } from "../modules/user/user.schema.js";

declare global {
  namespace Express {
    interface User {
      id?: string;
      _id?: any;
      userId?: string;
      username?: string;
      role?: UserRole;
      generateToken?: () => string;
    }
    interface Request {
      user?: User & {
        id?: string;
        userId?: string;
        username?: string;
        role?: UserRole;
      };
    }
  }
}

export {};
