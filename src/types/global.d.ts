import { DocumentType } from "@typegoose/typegoose";
import { User } from "../models/user.model";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: DocumentType<User>;
      session: {
        isLoggedIn?: boolean;
        user?: DocumentType<User>;
      };
    }
  }
}

declare module "express-session" {
  export interface SessionData {
    isLoggedIn?: boolean;
    user?: DocumentType<User>;
  }
}
