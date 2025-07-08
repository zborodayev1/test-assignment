import { CookieOptions, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AppError } from '../utils/appError.js';
import { sendSuccess } from '../utils/response.js';
import { signInSchema, signUpSchema } from '../validations/auth.validation.js';

export class AuthController {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }

  signUp = async (req: Request, res: Response) => {
    const validatedData = await signUpSchema.parseAsync(req.body);
    const result = await this.authService.signUp(validatedData);

    this.setTokenCookies(res, result);
    sendSuccess(res, { user: result.user }, 201);
  };

  signIn = async (req: Request, res: Response) => {
    const validatedData = await signInSchema.parseAsync(req.body);

    const result = await this.authService.signIn(validatedData);

    this.setTokenCookies(res, result);

    sendSuccess(res, { user: result.user });
  };

  signOut = async (req: Request, res: Response) => {
    const userId = req.userId;
    const user = req.user;

    if (!userId || !user) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    sendSuccess(res, { message: 'Logged out successfully' });
  };

  setTokenCookies(
    res: Response,
    { accessToken, refreshToken }: { accessToken: string; refreshToken: string }
  ) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
