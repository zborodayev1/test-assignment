import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { connectDB } from './config/db.ts';
import { CORS_ORIGIN, PORT } from './config/env.ts';
import { globalErrorHandler } from './middleware/globalErrorHandler.ts';
import { AuthRoutes } from './routes/auth.routes.ts';
import { UserRoutes } from './routes/user.routes.ts';

await connectDB();

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRoutes = new AuthRoutes();

const userRoutes = new UserRoutes();

app.use('/api/auth', authRoutes.router);

app.use('/api/user', userRoutes.router);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`${PORT}`);
});
