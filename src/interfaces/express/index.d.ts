import { IUser } from '../../models/user.model.ts';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IUser;
    }
  }
}
export {};
