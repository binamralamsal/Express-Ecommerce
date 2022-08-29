import { Router } from 'express';

import { Routes } from '../interfaces/routes.interface';
import AdminController from '../controllers/admin.controller';
import { checkSchema } from 'express-validator';
import { editProductBodySchema } from '../validators/admin.validators';
import authMiddleware from '../middlewares/auth.middleware';

class AdminRoutes implements Routes {
  public path = '/admin';
  public router = Router();
  public adminController = new AdminController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware);
    this.router.get('/products', this.adminController.getProducts);
    this.router.get('/add-product', this.adminController.getAddProduct);
    this.router.post('/add-product', checkSchema(editProductBodySchema), this.adminController.postAddProduct);
    this.router.get('/edit-product/:productId', this.adminController.getEditProduct);
    this.router.post('/edit-product', checkSchema(editProductBodySchema), this.adminController.postEditProduct);
    // this.router.post('/delete-product', this.adminController.postDeleteProduct);
    this.router.delete('/product/:productId', this.adminController.deleteProduct);
  }
}

export default AdminRoutes;
