import { Request, Response } from 'express';
import { UserService } from '../services/user.service.ts';
import { AppError } from '../utils/appError.js';
import { sendSuccess } from '../utils/response.js';
import {
  blockUserShema,
  getUsersQuerySchema,
  idParamsShema,
} from '../validations/user.validation.ts';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUserById = async (req: Request, res: Response) => {
    const { id } = await idParamsShema.parseAsync(req.params);
    const currentUser = req.user;
    const currentUserId = req.userId;

    if (!currentUser || !currentUserId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (currentUser.role !== 'admin' && currentUserId.toString() !== id) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    const user = await this.userService.getUserById(id);
    sendSuccess(res, { user });
  };

  getUsers = async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (currentUser.role !== 'admin') {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const {
      page = 1,
      limit = 10,
      search,
      isActive,
    } = await getUsersQuerySchema.parseAsync(req.query);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};
    if (search) {
      filters.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const users = await this.userService.getUsers(
      filters,
      Number(page),
      Number(limit)
    );

    sendSuccess(res, users);
  };

  blockUser = async (req: Request, res: Response) => {
    const { id } = await idParamsShema.parseAsync(req.params);
    const { reason } = await blockUserShema.parseAsync(req.body);
    const currentUser = req.user;
    const currentUserId = req.userId;

    if (!currentUser || !currentUserId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (currentUser.role === 'admin' && currentUserId.toString() === id) {
      throw new AppError(
        'Admin cannot block themselves',
        400,
        'INVALID_OPERATION'
      );
    }

    const targetUser = await this.userService.getUserById(id);
    if (
      targetUser.role === 'admin' &&
      currentUser.role === 'admin' &&
      currentUserId.toString() !== id
    ) {
      throw new AppError(
        'Cannot block another admin',
        400,
        'INVALID_OPERATION'
      );
    }

    let user;

    if (currentUserId.toString() === id) {
      user = await this.userService.blockUser(id, 'self');
    } else if (currentUser.role === 'admin') {
      user = await this.userService.blockUser(id, 'admin', reason);
    } else {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    sendSuccess(res, { user, message: 'User blocked successfully' });
  };

  unblockUser = async (req: Request, res: Response) => {
    const { id } = await idParamsShema.parseAsync(req.params);
    const currentUser = req.user;
    const currentUserId = req.userId;

    if (!currentUser || !currentUserId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (currentUserId.toString() === id || currentUser.role === 'admin') {
      const user = await this.userService.unblockUser(id);
      return sendSuccess(res, { user, message: 'User unblocked successfully' });
    } else {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }
  };
}
