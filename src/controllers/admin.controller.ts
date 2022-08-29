import { Request, Response, NextFunction } from 'express';

import { Product } from '../models';
import { validationResult } from 'express-validator';
import { deleteFile } from '../utils/file';

const ITEMS_PER_PAGE = 5;

class AdminController {
  /**
   * @desc    Fetch Product Page
   * @route   GET /admin/products
   * @access  Admin
   */
  public async getProducts(req: Request, res: Response, next: NextFunction) {
    const page = +(req.query.page || 1);

    try {
      const totalProducts = await Product.countDocuments({ userId: req.user?._id });
      const products = await Product.find({ userId: req.user?._id })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

      res.render('admin/products', {
        products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Fetch Add Product Page
   * @route   GET /admin/add-product
   * @access  Admin
   */
  public getAddProduct(_: Request, res: Response) {
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      product: null,
      errorMessages: [],
    });
  }

  /**
   * @desc    Add new Product
   * @route   POST /admin/add-product
   * @access  Admin
   */
  public postAddProduct(req: Request, res: Response) {
    const { title, description } = req.body;
    const price = +req.body.price;

    if (!req.file)
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        errorMessages: ['Attached file is not an image'],
        product: { title, price, description },
      });

    const imageUrl = `/uploads/images/${req.file.filename}`;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        errorMessages: errors.array().map(error => error.msg),
        product: { title, price, description },
      });
    }

    if (!req.user) return;
    const product = new Product({
      title,
      description,
      imageUrl,
      price,
      userId: req.user,
    });
    product
      .save()
      .then(() => {
        res.redirect('/');
      })
      .catch(error => console.log(error));
  }

  /**
   * @desc    Fetch Edit Product Page
   * @route   GET /admin/edit-product/:productId
   * @access  Admin
   */
  public getEditProduct(req: Request, res: Response) {
    const { productId } = req.params;

    Product.findById(productId)
      .then(product => {
        if (!product) return res.redirect('/');

        res.render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          errorMessages: [],
          product,
        });
      })
      .catch(error => {
        console.log(error);
        res.redirect('/');
      });
  }

  /**
   * @desc    Edit Specific Product
   * @route   POST /admin/edit-product
   * @access  Admin
   */
  public async postEditProduct(req: Request, res: Response, next: NextFunction) {
    const { title, price, description, productId } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        errorMessages: errors.array().map(error => error.msg),
        product: { title, price, description, _id: productId },
      });
    }

    try {
      const product = await Product.findById(productId);
      if (!product) return res.redirect('/');
      if (product.userId?.toString() !== req.user?._id.toString()) return res.redirect('/');

      product.title = title;
      product.price = price;
      product.description = description;

      if (req.file) {
        deleteFile(product.imageUrl);
        product.imageUrl = `/uploads/images/${req.file.filename}`;
      }
      await product.save();

      return res.redirect('/');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Delete Product
   * @route   POST /admin/delete-product
   * @access  Admin
   */
  public async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.productId;

    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      await product.remove();
      deleteFile(product.imageUrl.slice(1));
      res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product' });
    }
  }
}

export default AdminController;
