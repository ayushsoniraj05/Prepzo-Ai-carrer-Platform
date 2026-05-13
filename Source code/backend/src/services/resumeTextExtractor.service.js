import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '../..');

const normalizeText = (rawText = '') =>
  rawText
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

const toAbsoluteResumePath = (resumeUrl) => {
  const relativePath = String(resumeUrl || '').replace(/^\/+/, '');
  const absolutePath = path.resolve(BACKEND_ROOT, relativePath);

  if (!absolutePath.startsWith(BACKEND_ROOT)) {
    throw new Error('Invalid resume path');
  }

  return absolutePath;
};

export const extractResumeTextFromStoredFile = async (resumeUrl, resumeOriginalName = '') => {
  if (!resumeUrl) {
    throw new Error('No uploaded resume found');
  }

  const absolutePath = toAbsoluteResumePath(resumeUrl);
  const extension = path.extname(resumeOriginalName || resumeUrl).toLowerCase();
  const buffer = await fs.readFile(absolutePath);

  if (extension === '.pdf') {
    const parsed = await pdfParse(buffer);
    const text = normalizeText(parsed.text || '');
    if (!text) throw new Error('Could not extract text from PDF resume');
    return text;
  }

  if (extension === '.docx') {
    const parsed = await mammoth.extractRawText({ buffer });
    const text = normalizeText(parsed.value || '');
    if (!text) throw new Error('Could not extract text from DOCX resume');
    return text;
  }

  if (extension === '.doc') {
    throw new Error('DOC files are uploadable, but ATS extraction supports PDF or DOCX. Please upload PDF/DOCX or paste resume text.');
  }

  throw new Error('Unsupported resume format. Please upload PDF or DOCX, or paste resume text.');
};
