import app from './src/app.js';
import config from './src/config/index.js';
import { initializeEstatuto } from './src/services/estatuto.service.js';

async function bootstrap() {
  try {
    await initializeEstatuto();

    if (!config.gemini.apiKey) {
      console.warn(
        '[Config] GEMINI_API_KEY no está definida. El chat fallará hasta que cree .env con su clave de https://aistudio.google.com/apikey'
      );
    }

    app.listen(config.port, () => {
      console.log(`Servidor UASD Chat API escuchando en http://localhost:${config.port}`);
      console.log(`Frontend disponible en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('[Bootstrap]', error.message);
    process.exit(1);
  }
}

bootstrap();
