import { Response, Request, NextFunction } from 'express';
import { DocumentType } from '@typegoose/typegoose';

import { Order, Product } from '../models';
import { Order as OrderClass } from '../models/order.model';
import { Product as ProductClass } from '../models/product.model';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import Stripe from 'stripe';

const ITEMS_PER_PAGE = 5;
const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: '2020-08-27',
});

class ShopController {
  /**
   * @desc    Fetch Home Page
   * @route   GET /
   * @access  Public
   */
  public async getIndex(req: Request, res: Response) {
    const page = +(req.query.page || 1);

    try {
      const totalProducts = await Product.countDocuments();
      const products = await Product.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

      res.render('shop/index', {
        products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @desc    Fetch All Products Page
   * @route   GET /products
   * @access  Public
   */
  public async getProducts(req: Request, res: Response, next: NextFunction) {
    const page = +(req.query.page || 1);

    try {
      const totalProducts = await Product.countDocuments();
      const products = await Product.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

      res.render('shop/product-list', {
        products: products,
        pageTitle: 'Shop',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Fetch Specific Product Page
   * @route   GET /products/:productId
   * @access  Public
   */
  public getProduct(req: Request, res: Response) {
    const { productId } = req.params;
    Product.findById(productId)
      .then(product => {
        if (product) {
          return res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
          });
        }

        res.redirect('/');
      })
      .catch(error => {
        console.log(error);
        res.redirect('/');
      });
  }

  /**
   * @desc    Fetch Cart Page
   * @route   GET /cart
   * @access  Public
   */
  public async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await req.user?.populate('cart.items.productId');
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: user?.cart.items,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Add Product to Cart
   * @route   POST /cart
   * @access  Public
   */
  public postCart(req: Request, res: Response) {
    const { productId } = req.body;

    Product.findById(productId)
      .then(product => {
        if (!product) throw new Error('Product not found!');
        return req.user?.addToCart(product);
      })
      .then(() => {
        res.redirect('/cart');
      })
      .catch(error => console.log(error));
  }

  /**
   * @desc    Delete Products from Cart
   * @route   POST /cart-delete-item
   * @access  Public
   */
  public postCartDeleteProduct(req: Request, res: Response) {
    const { productId } = req.body;

    req.user
      ?.removeFromCart(productId)
      .then(() => res.redirect('/cart'))
      .catch(error => console.log(error));
  }

  /**
   * @desc    Create new Order
   * @route   POST /create-order
   * @access  Public
   */
  public postOrder(req: Request, res: Response) {
    req.user
      ?.populate('cart.items.productId')
      .then(user => {
        const products = user.cart.items.map(cartItem => {
          return {
            product: { ...cartItem.productId },
            quantity: cartItem.quantity,
          };
        });

        return Order.create({
          products,
          user: {
            email: req.user?.email,
            userId: req.user,
          },
        });
      })
      .then(() => {
        return req.user?.clearCart();
      })
      .then(() => res.redirect('/orders'))
      .catch(error => console.log(error));
  }

  /**
   * @desc    Fetch Orders Page
   * @route   GET /orders
   * @access  Public
   */
  public getOrders(req: Request, res: Response) {
    Order.find({ 'user.userId': req.user?._id })
      .then(orders => {
        res.render('shop/orders', {
          pageTitle: 'Your Orders',
          path: '/orders',
          orders,
        });
      })
      .catch(error => console.log(error));
  }

  /**
   * @desc    Get Invoice of an Order
   * @route   GET /orders/:orderId
   * @access  Public
   */
  public async getInvoice(req: Request, res: Response, next: NextFunction) {
    const orderId = req.params.orderId;

    try {
      const order: DocumentType<OrderClass> | null = await Order.findById(orderId);
      if (!order) throw new Error('File not found');
      if (order.user?.userId?.toString() !== req.user?._id.toString()) throw new Error('Unauthorized');

      const invoiceName = `invoice-${order._id}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=' + invoiceName);

      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text(`Invoice #${order._id}`, { underline: true });
      pdfDoc.text('-----------------------');

      let totalPrice = 0;
      order.products.forEach(product => {
        totalPrice += product.quantity * product.product.price;
        pdfDoc.fontSize(16).text(`${product.product.title} - ${product.quantity} x $${product.product.price}`);
      });
      pdfDoc.text('------');
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
      pdfDoc.end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Fetch Checkout Page
   * @route   GET /checkout
   * @access  Public
   */
  public async getCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await req.user?.populate('cart.items.productId');
      const products = user?.cart.items;
      if (!products) throw new Error("You don't have any products in your cart!");

      let totalSum = 0;
      products.forEach(product => {
        totalSum += product.quantity * (product.productId as DocumentType<ProductClass>).price;
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(product => {
          return {
            name: (product.productId as DocumentType<ProductClass>).title,
            description: (product.productId as DocumentType<ProductClass>).description,
            amount: (product.productId as DocumentType<ProductClass>).price * 100,
            quantity: product.quantity,
            currency: 'usd',
          };
        }),
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });

      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        products,
        totalSum,
        sessionId: session.id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Create new Order
   * @route   POST /create-order
   * @access  Public
   */
  public async getCheckoutSuccess(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await req.user?.populate('cart.items.productId');
      if (!user) throw new Error('Error Occured');

      const products = user.cart.items.map(cartItem => {
        return {
          product: { ...cartItem.productId },
          quantity: cartItem.quantity,
        };
      });

      await Order.create({
        products,
        user: {
          email: req.user?.email,
          userId: req.user,
        },
      });

      await req.user?.clearCart();

      res.redirect('/orders');
    } catch (error) {
      next(error);
    }
  }
}

export default ShopController;
