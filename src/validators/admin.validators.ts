import { Schema } from 'express-validator';

const editProductBodySchema: Schema = {
  title: {
    trim: true,
    isString: true,
    isLength: {
      options: { min: 3 },
    },
    errorMessage: 'Please enter a valid title, must be at least 3 characters',
  },
  // imageUrl: {
  //   isURL: true,
  //   errorMessage: "Please enter a valid image URL",
  // },
  price: {
    isFloat: true,
    errorMessage: 'Please enter a valid price',
  },
  description: {
    trim: true,
    isString: true,
    isLength: {
      options: { min: 5 },
    },
    errorMessage: 'Please enter a valid description, must be at least 5 characters',
  },
};

export { editProductBodySchema };
