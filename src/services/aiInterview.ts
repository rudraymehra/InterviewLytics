import { GoogleGenerativeAI } from '@google/generative-ai';

const getGemini = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  try { return new GoogleGenerativeAI(key); } catch { return null; }
};

export interface NextQuestionInput {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  transcript: { question: string; answer?: string }[];
}

export const generateNextQuestion = async (input: NextQuestionInput): Promise<string> => {
  const client = getGemini();
  const basePrompt = `You are a technical interviewer for ${input.jobTitle}. Ask short, precise, Google-style probing questions and cross-questions.
Rules:
- Ask ONE question at a time (max 180 characters).
- Probe depth: challenge claims with specifics (metrics, architecture, trade-offs, edge cases).
- Prefer follow-ups based on the last answer; if none, start with a core competency.
- Avoid filler and avoid multi-part questions.`;

  const history = input.transcript.map(t => `Q: ${t.question}\nA: ${t.answer || ''}`).join('\n');
  const context = `Job requirements: ${input.requiredSkills.join(', ')}\nDescription: ${input.jobDescription}`;

  if (!client) {
    // Fallback heuristic question
    const last = input.transcript[input.transcript.length - 1];
    if (last?.answer) {
      return `Can you detail the architecture and key trade-offs you made in that project?`;
    }
    return `What was your most impactful project related to ${input.requiredSkills[0] || 'the role'} and why?`;
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const resp = await model.generateContent([
    { role: 'user', parts: [{ text: basePrompt }] },
    { role: 'user', parts: [{ text: `Context:\n${context}\nTranscript so far:\n${history}\nReturn ONLY the next question.` }] }
  ]);
  const q = resp.response?.text()?.trim() || '';
  return q.replace(/^"|"$/g, '');
};

export const scoreAnswer = async (question: string, answer: string): Promise<{ score: number; notes: string }> => {
  const client = getGemini();
  const fallback = { score: Math.min(10, Math.max(0, Math.round(answer.length / 100))), notes: 'Heuristic score (fallback). Longer answer indicates more detail.' };
  if (!client) return fallback;
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Evaluate the candidate's answer on a 0-10 scale for technical depth, clarity, and correctness. Return JSON {"score":<0..10>,"notes":"<<=180 chars>"}.\nQuestion: ${question}\nAnswer: ${answer}`;
  const resp = await model.generateContent([{ role: 'user', parts: [{ text: prompt }] }]);
  const text = resp.response?.text() || '';
  try {
    const s = JSON.parse(text);
    return { score: Math.max(0, Math.min(10, Math.round(Number(s.score) || 0))), notes: String(s.notes || '').slice(0, 180) };
  } catch {
    return fallback;
  }
};


