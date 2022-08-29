import path from 'path';

import csrf from 'csurf';
import multer from 'multer';
import flash from 'connect-flash';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connect, set } from 'mongoose';
import express, { Application } from 'express';

import { Routes } from './interfaces/routes.interface';
import userMiddleware from './middlewares/user.middleware';
import ErrorController from './controllers/error.controller';
import errorMiddleware from './middlewares/error.middleware';
import localsMiddleware from './middlewares/locals.middleware';

class App {
  public app: Application;
  public env: string;
  public port: string | number;
  private readonly mongodbUri: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 3000;
    this.mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1/learn-node';

    this.app.set('view engine', 'ejs');
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public async listen() {
    await this.connectToMongodb();

    this.app.listen(this.port, () => {
      console.log(`=================================`);
      console.log(`======= ENV: ${this.env} =======`);
      console.log(`🚀 App listening on the port ${this.port}`);
      console.log(`=================================`);
    });
  }

  private async connectToMongodb() {
    try {
      if (this.env !== 'production') {
        set('debug', true);
      }

      await connect(this.mongodbUri);
    } catch (error) {
      process.exit(0);
    }
  }

  private initializeMiddlewares() {
    const sessionConfig = {
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: this.mongodbUri,
        collectionName: 'sessions',
      }),
    };

    const fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads', 'images'));
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(session(sessionConfig));
    this.app.use(
      multer({
        storage: fileStorage,
        fileFilter: (req, file, cb) => {
          if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true);
          } else {
            cb(null, false);
          }
        },
      }).single('image'),
    );
    this.app.use(csrf());
    this.app.use(flash());
    this.app.use(userMiddleware);
    this.app.use(localsMiddleware);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use(route.path, route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(new ErrorController().get404);
    this.app.use(errorMiddleware);
  }
}

export default App;
