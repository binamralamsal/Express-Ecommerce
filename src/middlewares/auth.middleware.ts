import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

export default authMiddleware;
