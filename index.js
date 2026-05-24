import express from 'express';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Truco nativo de Node.js para poder importar librerías clásicas en un entorno ESM
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// Inicializar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar el SDK de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let estatutoTexto = '';

// Leer y extraer el texto del PDF al arrancar el servidor
async function cargarContexto() {
    try {
        const dataBuffer = fs.readFileSync('ESTATUTO-ORGANICO-UASD.pdf');
        const data = await pdf(dataBuffer);
        estatutoTexto = data.text;
        console.log('✅ Estatuto cargado en memoria con éxito.');
    } catch (error) {
        console.error('❌ Error leyendo el PDF:', error);
    }
}

// Endpoint principal del Chatbot
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Debes enviar una pregunta.' });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `Eres un asistente virtual experto en la Universidad Autónoma de Santo Domingo (UASD).
            Tu única fuente de información es el texto del Estatuto Orgánico que se proporciona a continuación.
            
            Regla estricta: NO inventes información. Si la respuesta a la pregunta del usuario NO está explícitamente en el texto, debes responder exactamente: "No tengo información suficiente en el Estatuto Orgánico para responder a esa pregunta."
            Responde de forma clara, breve y coherente.

            TEXTO DEL ESTATUTO:
            ${estatutoTexto}`
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ respuesta: text });

    } catch (error) {
        console.error('Error con Gemini:', error);
        res.status(500).json({ error: 'Hubo un problema procesando tu solicitud.' });
    }
});

const PORT = 3001;
app.listen(PORT, async () => {
    await cargarContexto();
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});