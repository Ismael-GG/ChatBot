import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import { buildSystemPrompt, FALLBACK_RESPONSE } from '../prompts/system.prompt.js';

let genAI = null;

function getClient() {
  if (!config.gemini.apiKey) {
    const error = new Error(
      'GEMINI_API_KEY no está configurada. Cree un archivo .env en la raíz del proyecto con su clave de Google AI Studio.'
    );
    error.statusCode = 503;
    throw error;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  return genAI;
}

function toGeminiError(error) {
  const status = error.status ?? error.statusCode;

  if (status === 429) {
    const apiError = new Error(
      'Se agotó la cuota de la API de Gemini. Espere un momento e intente de nuevo, o use el modelo gemini-2.5-flash en .env.'
    );
    apiError.statusCode = 429;
    return apiError;
  }

  if (status === 401 || status === 403) {
    const apiError = new Error(
      'La clave GEMINI_API_KEY no es válida o no tiene permisos. Verifique su clave en Google AI Studio.'
    );
    apiError.statusCode = 503;
    return apiError;
  }

  if (status === 404) {
    const apiError = new Error(
      `El modelo "${config.gemini.model}" no está disponible. Configure GEMINI_MODEL=gemini-2.5-flash en .env.`
    );
    apiError.statusCode = 503;
    return apiError;
  }

  return error;
}

export async function generateChatResponse(userMessage, estatutoContext) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: config.gemini.model,
    systemInstruction: buildSystemPrompt(estatutoContext),
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 20,
    },
  });

  let result;

  try {
    result = await model.generateContent(userMessage);
  } catch (error) {
    throw toGeminiError(error);
  }
  const response = result.response;

  if (!response) {
    throw new Error('La API de Gemini no devolvió una respuesta válida.');
  }

  const text = response.text();

  if (!text || text.trim().length === 0) {
    throw new Error('La API de Gemini devolvió una respuesta vacía.');
  }

  return text.trim();
}

export { FALLBACK_RESPONSE };
