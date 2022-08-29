import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/HttpException';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    console.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    return res.status(status).render('500', {
      pageTitle: 'Error',
      path: '/500',
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
