import { User } from "../models";
import { NextFunction, Request, Response } from 'express';

const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.session?.user?._id);
    if (user) req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default userMiddleware;
