import App from './app';
import AdminRoutes from './routes/admin.route';
import ShopRoutes from './routes/shop.route';
import AuthRoutes from './routes/auth.route';

const app = new App([new AdminRoutes(), new ShopRoutes(), new AuthRoutes()]);
app.listen();
