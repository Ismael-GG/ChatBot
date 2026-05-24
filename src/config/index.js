import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const config = {
  port: Number(process.env.PORT) || 3000,
  frontendUrl: process.env.FRONTEND_URL || '',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  estatuto: {
    sourcePath: process.env.ESTATUTO_PATH
      ? path.resolve(process.env.ESTATUTO_PATH)
      : process.env.ESTATUTO_PDF_PATH
        ? path.resolve(process.env.ESTATUTO_PDF_PATH)
        : null,
    candidatePaths: [
      path.resolve(projectRoot, 'data/ESTATUTO-ORGANICO-UASD.pdf'),
      path.resolve(projectRoot, 'data/estatuto_uasd.pdf'),
      path.resolve(projectRoot, 'data/estatuto-organico.txt'),
    ],
  },
};

export default config;
