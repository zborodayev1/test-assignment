import { Types } from 'mongoose';
import { UserFilters } from '../interfaces/user/user.interface.ts';
import { IUser } from '../models/user.model.ts';
import { UserRepository } from '../repositories/user.repository.ts';
import { AppError } from '../utils/appError.ts';
import { logger } from '../utils/logger.ts';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400, 'INVALID_ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: IUser) {
    const userObj = user.toObject ? user.toObject() : user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitized } = userObj;
    return sanitized;
  }

  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findAll(filters, null, {
        skip,
        limit,
        sort: { createdAt: -1 },
      }),
      this.userRepository.countDocuments(filters),
    ]);

    const sanitizedUsers = users.map((user) => this.sanitizeUser(user));

    return {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  async blockUser(id: string, blockedBy: 'self' | 'admin', reason?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400, 'INVALID_ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError(
        'User is already blocked',
        400,
        'USER_ALREADY_BLOCKED'
      );
    }

    const updatedUser = await this.userRepository.updateById(id, {
      isActive: false,
      blocked: {
        by: blockedBy,
        reason: reason || 'no reason',
        at: new Date(),
      },
    });

    if (!updatedUser) {
      throw new AppError('Error while create user', 500, 'SERVER_ERROR');
    }

    logger.info(`User ${user.email} has been blocked`);

    return this.sanitizeUser(updatedUser);
  }

  async unblockUser(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400, 'INVALID_ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.isActive) {
      throw new AppError('User is already active', 400, 'USER_ALREADY_ACTIVE');
    }

    const updatedUser = await this.userRepository.updateById(id, {
      isActive: true,
      blocked: null,
    });

    if (!updatedUser) {
      throw new AppError('Error while create user', 500, 'SERVER_ERROR');
    }

    logger.info(`User ${user.email} has been unblocked`);

    return this.sanitizeUser(updatedUser);
  }
}
