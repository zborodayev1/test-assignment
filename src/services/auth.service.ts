import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { SALT_ROUNDS } from '../config/env.js';

import {
  ICreateUserDTO,
  ICreateUserInternalDTO,
  ISignInDTO,
} from '../interfaces/user/user.dto.js';
import { IUser } from '../models/user.model.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { TokenService } from './token.service.js';

export class AuthService {
  private userRepository: UserRepository;
  private tokenService: TokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
  }

  async signUp(userData: ICreateUserDTO) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const existingUser = await this.userRepository.findByEmail(
          userData.email
        );

        if (existingUser) {
          throw new AppError('User already exists', 409, 'USER_EXISTS');
        }

        const hashedPassword = await this.hashPassword(userData.password);

        const userToCreate: ICreateUserInternalDTO = {
          fullName: userData.fullName,
          dateOfBirth: userData.dateOfBirth,
          email: userData.email,
          passwordHash: hashedPassword,
          provider: 'local',
          role: 'user',
          isActive: true,
        };

        const user = await this.userRepository.create(userToCreate, {
          session,
        });

        const tokens = await this.tokenService.generateTokenPair(user);

        logger.info(`User registered ${userData.email}`);

        return {
          user: this.sanitizeUser(user),
          ...tokens,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  async signIn(userData: ISignInDTO) {
    const user = await this.userRepository.findByEmail(userData.email);
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }
    await this.verifyPassword(userData.password, user.passwordHash);

    const tokens = await this.tokenService.generateTokenPair(user);
    logger.info(`User signed in ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(Number(SALT_ROUNDS));
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(password: string, hash: string) {
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) {
      throw new AppError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }
  }

  sanitizeUser(user: IUser) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, serverRole, ...sanitized } = user.toObject();
    return sanitized;
  }
}
