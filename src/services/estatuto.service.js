import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';
import config from '../config/index.js';

/** @type {string | null} */
let estatutoContext = null;

/** @type {{ path: string; isSample: boolean } | null} */
let estatutoSource = null;

function validateEstatutoContent(text) {
  const normalized = text.trim();

  if (normalized.length < 200) {
    return { valid: false, reason: 'El archivo contiene muy poco texto.' };
  }

  const looksLikeUasd =
    /UASD|Universidad Aut[oó]noma de Santo Domingo/i.test(normalized);
  const looksLikeStatute = /estatuto|art[ií]culo/i.test(normalized);

  if (!looksLikeUasd || !looksLikeStatute) {
    return {
      valid: false,
      reason:
        'El archivo cargado no parece ser el Estatuto Orgánico de la UASD.',
    };
  }

  return { valid: true };
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function extractTextFromPdf(pdfPath) {
  const pdfBuffer = await readFile(pdfPath);
  const parser = new PDFParse({ data: pdfBuffer });

  try {
    const { text, total } = await parser.getText();
    return { text: text?.trim() ?? '', totalPages: total };
  } finally {
    await parser.destroy();
  }
}

async function loadTextFromPath(sourcePath) {
  const extension = path.extname(sourcePath).toLowerCase();

  if (extension === '.txt') {
    const text = (await readFile(sourcePath, 'utf8')).trim();
    return { text, totalPages: null };
  }

  if (extension === '.pdf') {
    return extractTextFromPdf(sourcePath);
  }

  throw new Error(
    `Formato no soportado (${extension}). Use un archivo .pdf o .txt del Estatuto Orgánico.`
  );
}

async function resolveCandidatePaths() {
  if (config.estatuto.sourcePath) {
    return [config.estatuto.sourcePath];
  }

  const candidates = config.estatuto.candidatePaths.filter(Boolean);
  const existing = [];

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      existing.push(candidate);
    }
  }

  return existing;
}

export async function initializeEstatuto() {
  if (estatutoContext) {
    return estatutoContext;
  }

  const candidates = await resolveCandidatePaths();

  if (candidates.length === 0) {
    throw new Error(
      'No se encontró el Estatuto Orgánico. Coloque ESTATUTO-ORGANICO-UASD.pdf en data/ o configure ESTATUTO_PATH.'
    );
  }

  const errors = [];

  for (const sourcePath of candidates) {
    try {
      const { text, totalPages } = await loadTextFromPath(sourcePath);

      if (!text) {
        errors.push(`${path.basename(sourcePath)}: sin texto extraíble.`);
        continue;
      }

      const validation = validateEstatutoContent(text);

      if (!validation.valid) {
        errors.push(`${path.basename(sourcePath)}: ${validation.reason}`);
        continue;
      }

      estatutoContext = text;
      estatutoSource = {
        path: sourcePath,
        isSample: path.basename(sourcePath) === 'estatuto-organico.txt',
      };

      const pagesLabel =
        totalPages != null ? `${totalPages} páginas, ` : '';

      console.log(
        `[Estatuto] Cargado: ${sourcePath} (${pagesLabel}${estatutoContext.length} caracteres)`
      );

      if (estatutoSource.isSample) {
        console.warn(
          '[Estatuto] Usando archivo de ejemplo. Para respuestas completas, coloque el PDF oficial en data/ESTATUTO-ORGANICO-UASD.pdf.'
        );
      }

      return estatutoContext;
    } catch (error) {
      errors.push(`${path.basename(sourcePath)}: ${error.message}`);
    }
  }

  throw new Error(
    `No se pudo cargar un Estatuto Orgánico válido de la UASD.\n${errors.join('\n')}`
  );
}

export function getEstatutoContext() {
  if (!estatutoContext) {
    throw new Error(
      'El Estatuto Orgánico no está cargado en memoria. Reinicie el servidor.'
    );
  }

  return estatutoContext;
}

export function isEstatutoLoaded() {
  return estatutoContext !== null;
}

export function getEstatutoInfo() {
  return {
    loaded: estatutoContext !== null,
    sourcePath: estatutoSource?.path ?? null,
    isSample: estatutoSource?.isSample ?? false,
    characters: estatutoContext?.length ?? 0,
  };
}
