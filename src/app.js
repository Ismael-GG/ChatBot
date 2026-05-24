import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, '../public');

const app = express();

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ismael-gg.github.io',
]);

if (config.frontendUrl) {
  allowedOrigins.add(config.frontendUrl.replace(/\/$/, ''));
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, '');

      if (
        allowedOrigins.has(normalizedOrigin) ||
        normalizedOrigin.startsWith('https://ismael-gg.github.io')
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);
app.use(express.static(publicPath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
