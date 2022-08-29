import { Request, Response } from 'express';

class ErrorController {
  public get404(_: Request, res: Response) {
    res.render('404', {
      pageTitle: 'Page Not Found',
      path: '404',
    });
  }
}

export default ErrorController;
