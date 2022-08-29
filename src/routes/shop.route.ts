import { Router } from 'express';

import { Routes } from '../interfaces/routes.interface';
import ShopController from '../controllers/shop.controller';
import authMiddleware from '../middlewares/auth.middleware';

class ShopRoutes implements Routes {
  public path = '/';
  public router = Router();
  public shopController = new ShopController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.shopController.getIndex);
    this.router.get('/products', this.shopController.getProducts);
    this.router.get('/products/:productId', this.shopController.getProduct);
    this.router.get('/cart', authMiddleware, this.shopController.getCart);
    this.router.post('/cart', authMiddleware, this.shopController.postCart);
    this.router.post('/cart-delete-item', authMiddleware, this.shopController.postCartDeleteProduct);
    this.router.get('/orders', authMiddleware, this.shopController.getOrders);
    this.router.get('/orders/:orderId', authMiddleware, this.shopController.getInvoice);
    // this.router.post('/create-order', authMiddleware, this.shopController.postOrder);
    this.router.get('/checkout', authMiddleware, this.shopController.getCheckout);
    this.router.get('/checkout/cancel', authMiddleware, this.shopController.getCheckout);
    this.router.get('/checkout/success', authMiddleware, this.shopController.getCheckoutSuccess);
  }
}

export default ShopRoutes;
