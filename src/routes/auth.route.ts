import { Routes } from '../interfaces/routes.interface';
import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { checkSchema } from 'express-validator';
import { loginBodySchema, signupBodySchema } from '../validators/auth.validators';

class AuthRoutes implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/login', this.authController.getLogin);
    this.router.post('/login', checkSchema(loginBodySchema), this.authController.postLogin);
    this.router.get('/signup', this.authController.getSignup);
    this.router.post('/signup', checkSchema(signupBodySchema), this.authController.postSignup);
    this.router.get('/reset', this.authController.getReset);
    this.router.post('/reset', this.authController.postReset);
    this.router.get('/reset/:token', this.authController.getNewPassword);
    this.router.post('/new-password', this.authController.postNewPassword);
    this.router.post('/logout', this.authController.postLogout);
  }
}

export default AuthRoutes;
