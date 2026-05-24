import { Router } from 'express';
import path from 'node:path';
import chatRoutes from './chat.routes.js';
import { isEstatutoLoaded, getEstatutoInfo } from '../services/estatuto.service.js';

const router = Router();

router.get('/health', (_req, res) => {
  const estatuto = getEstatutoInfo();

  res.status(200).json({
    success: true,
    message: 'Servidor UASD Chat API operativo.',
    estatutoLoaded: isEstatutoLoaded(),
    estatutoSource: estatuto.sourcePath ? path.basename(estatuto.sourcePath) : null,
    estatutoIsSample: estatuto.isSample,
  });
});

router.use('/chat', chatRoutes);

export default router;
