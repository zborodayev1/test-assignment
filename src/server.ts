import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { connectDB } from './node/config/db.js';
import { CORS_ORIGIN, PORT } from './node/config/env.js';
import { globalErrorHandler } from './node/middleware/globalErrorHandler.js';
import authRoutes from './node/routes/auth.routes.js';

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

app.use('/api/auth', authRoutes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`${PORT}`);
});
