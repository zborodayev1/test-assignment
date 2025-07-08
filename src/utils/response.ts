import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json(data);
