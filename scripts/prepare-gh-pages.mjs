import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');
const outputDir = path.resolve(projectRoot, '.gh-pages');

const apiBase = (process.env.API_BASE_URL || process.env.RENDER_API_URL || '').replace(/\/$/, '');

if (!apiBase) {
  console.error(
    '[deploy] Falta API_BASE_URL. Ejemplo:\n' +
      '  API_BASE_URL=https://uasd-chat-api.onrender.com npm run deploy:frontend'
  );
  process.exit(1);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(publicDir, outputDir, { recursive: true });

const configContent = `window.APP_CONFIG = {
  apiBase: '${apiBase}',
};
`;

await writeFile(path.join(outputDir, 'js', 'config.js'), configContent, 'utf8');

console.log(`[deploy] Frontend listo en .gh-pages/`);
console.log(`[deploy] API apuntando a: ${apiBase}`);
