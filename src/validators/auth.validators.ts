import { User } from '../models';
import { Schema } from 'express-validator';

const signupBodySchema: Schema = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Please enter a valid email',
    custom: {
      options: async value => {
        const user = await User.findOne({ email: value });
        if (user) return Promise.reject('Email already exists');
      },
    },
  },
  password: {
    trim: true,
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters',
    },
  },
  confirmPassword: {
    trim: true,
    custom: {
      options: (value, { req }) => {
        return value === req.body.password;
      },
      errorMessage: 'Passwords do not match',
    },
  },
};

const loginBodySchema: Schema = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Please enter a valid email',
    custom: {
      options: async value => {
        const user = await User.findOne({ email: value });
        if (!user) return Promise.reject("Email doesn't exist");
      },
    },
  },
  password: {
    trim: true,
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters',
    },
  },
};

export { signupBodySchema, loginBodySchema };
