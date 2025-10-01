import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Safely load Gemini client if key exists
const getGemini = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  try {
    return new GoogleGenerativeAI(key);
  } catch {
    return null;
  }
};

// Extract plain text from a resume file (supports .txt, .pdf for MVP)
export const extractTextFromResume = async (resumePath: string): Promise<string> => {
  try {
    const ext = path.extname(resumePath).toLowerCase();
    const abs = path.resolve(process.cwd(), resumePath.replace(/^\//, ''));
    if (!fs.existsSync(abs)) return '';

    if (ext === '.txt') {
      return fs.readFileSync(abs, 'utf8');
    }

    if (ext === '.pdf') {
      // Use pdf-parse (CommonJS)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(abs);
      const result = await pdfParse(buffer);
      return (result?.text as string) || '';
    }
  } catch (_) {}
  return '';
};

export interface GeminiScoreResult {
  score: number; // 0-100
  summary: string;
  skills: string[];
}

export const scoreWithGemini = async (resumeText: string, jobTitle: string, jobDescription: string, requiredSkills: string[] = []): Promise<GeminiScoreResult | null> => {
  const client = getGemini();
  if (!client) return null;

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const systemPrompt = `You are an assistant that evaluates candidate resumes against a job. Output strictly JSON with keys: score (0-100 integer), summary (string <= 500 chars), skills (array of strings).`;
  const userPrompt = `Job Title: ${jobTitle}\nRequired Skills: ${requiredSkills.join(', ')}\nJob Description: ${jobDescription}\n---\nResume Text:\n${resumeText}\n\nReturn JSON only.`;

  const resp = await model.generateContent([{ role: 'user', parts: [{ text: systemPrompt }] }, { role: 'user', parts: [{ text: userPrompt }] }]);
  const text = resp.response?.text() || '';
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const payload = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const score = Math.max(0, Math.min(100, Math.round(Number(payload.score) || 0)));
    const summary = String(payload.summary || '').slice(0, 500);
    const skills = Array.isArray(payload.skills) ? payload.skills.map((s: any) => String(s)).slice(0, 50) : [];
    return { score, summary, skills };
  } catch {
    return null;
  }
};


