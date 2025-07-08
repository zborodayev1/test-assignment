import express, { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthMiddleware } from '../middleware/checkAuthMiddleware.js';

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/sign-up', this.authController.signUp);
    this.router.post('/sign-in', this.authController.signIn);
    this.router.post(
      '/sign-out',
      (req, res, next) => {
        Promise.resolve(this.authMiddleware.checkAuth(req, res, next)).catch(
          next
        );
      },
      this.authController.signOut
    );
  }
}
