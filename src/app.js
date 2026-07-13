import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('/api', postRoutes);
app.use('/api', eventRoutes);

app.use((req, res, next) => {
  const err = new Error(`Rota ${req.originalUrl} não encontrada`);
  err.status = 404;
  next(err);
});

app.use(errorHandler);

export default app;
