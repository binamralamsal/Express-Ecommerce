import { NextFunction, Request, Response } from 'express';

const localsMiddleware = ( req: Request, res: Response, next: NextFunction) => {
  try {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  } catch (error) {
    next(error);
  }
};

export default localsMiddleware;
