import { Request } from "express";
import { User } from "../models/user.model";
import { DocumentType } from "@typegoose/typegoose";

export interface RequestWIthUser extends Request {
  user: DocumentType<User>;
}
