import express, { Router } from 'express';
import { UserController } from '../controllers/user.controller.ts';
import { AuthMiddleware } from '../middleware/checkAuthMiddleware.js';

export class UserRoutes {
  public router: Router;
  private userController: UserController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.userController = new UserController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use((req, res, next) => {
      Promise.resolve(this.authMiddleware.checkAuth(req, res, next)).catch(
        next
      );
    });

    this.router.get('/:id', this.userController.getUserById);
    this.router.get('/', this.userController.getUsers);
    this.router.patch('/:id/block', this.userController.blockUser);
    this.router.patch('/:id/unblock', this.userController.unblockUser);
  }
}
