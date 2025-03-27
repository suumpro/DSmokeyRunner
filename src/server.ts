import express from 'express';
import cors from 'cors';
import projectsRouter from './routes/projects';
import analyticsRouter from './routes/analytics';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/analytics', analyticsRouter);

export default app; 