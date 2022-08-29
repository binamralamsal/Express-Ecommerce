import { Request, Response } from 'express';
import { User } from '../models';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { validationResult } from 'express-validator';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class AuthController {
  /**
   * @desc    Fetch Login Page
   * @route   GET /login
   * @access  Public
   */
  public getLogin(req: Request, res: Response) {
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessages: req.flash('error'),
      oldInput: { email: '' },
    });
  }

  /**
   * @desc    Login to a user
   * @route   POST /login
   * @access  Public
   */
  public async postLogin(req: Request, res: Response) {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessages: errors.array().map(error => error.msg),
        oldInput: { email },
      });
    }

    try {
      const user = await User.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessages: ['Invalid email or password'],
          oldInput: { email },
        });
      }

      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(() => {
        res.redirect('/');
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @desc    Fetch Register Page
   * @route   GET /signup
   * @access  Public
   */
  public getSignup(req: Request, res: Response) {
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessages: req.flash('error'),
      oldInput: { email: '' },
    });
  }

  /**
   * @desc    Create a new user
   * @route   POST /signup
   * @access  Public
   */
  public async postSignup(req: Request, res: Response) {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessages: errors.array().map(error => error.msg),
        oldInput: { email },
      });
    }

    try {
      const user = await User.create({ email, password });
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(async () => {
        res.redirect('/');
        // await transporter.sendMail({
        //   to: email,
        //   from: "binamraprogrammer@outlook.com",
        //   subject: "Welcome to Binamra's E-Commerce",
        //   html: "<h1>Thank you so much for regisering on our website! Have fun.</h1>",
        // });
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @desc    Logout a User
   * @route   POST /logout
   * @access  Public
   */
  public postLogout(req: Request, res: Response) {
    req.session.destroy(error => {
      if (error) console.log(error);
      res.redirect('/');
    });
  }

  /**
   * @desc    Get Reset Password Page
   * @route   GET /reset
   * @access  Public
   */
  public getReset(req: Request, res: Response) {
    res.render('auth/reset', {
      path: '/reset',
      pageTitle: 'Reset Password',
      errorMessages: req.flash('error'),
    });
  }

  /**
   * @desc    Reset User Password
   * @route   POST /reset
   * @access  Public
   */
  public postReset(req: Request, res: Response) {
    const { email } = req.body;

    crypto.randomBytes(32, async (error, buffer) => {
      try {
        if (error) {
          console.log(error);
          return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        const user = await User.findOne({ email });

        if (!user) {
          req.flash('error', 'No account with that email exists');
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = new Date(Date.now() + 3600000);
        await user.save();

        res.redirect('/');
        await transporter.sendMail({
          to: email,
          from: process.env.EMAIL_USER,
          subject: 'Password Reset',
          html: `<p>You requested a password reset</p>
                 <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>`,
        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  /**
   * @desc    Get new Password Page
   * @route   GET /reset/:token
   * @access  Public
   */
  public async getNewPassword(req: Request, res: Response) {
    const token = req.params.token;

    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired');
        return res.redirect('/reset');
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Reset Password',
        errorMessages: req.flash('error'),
        userId: user._id.toString(),
        passwordToken: token,
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @desc    Update User Password
   * @route   POST /new-password
   * @access  Public
   */
  public async postNewPassword(req: Request, res: Response) {
    const { newPassword, currentPassword, userId, passwordToken: token } = req.body;

    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
      });
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired');
        return res.redirect('/reset');
      }

      if (!(await user.comparePassword(currentPassword))) {
        req.flash('error', 'Incorrect current password');
        return res.redirect('/reset');
      }

      await user.updatePassword(newPassword);
      req.session.destroy(error => {
        if (error) console.log(error);
        res.redirect('/login');
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default AuthController;
