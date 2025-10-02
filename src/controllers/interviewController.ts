import { Request, Response } from 'express';
import InterviewSession from '../models/InterviewSession';
import Job from '../models/Job';
import User from '../models/User';
import Application from '../models/Application';
import { generateNextQuestion, scoreAnswer } from '../services/aiInterview';
import { notifyCandidateInterviewComplete } from '../services/emailService';

export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.body;
    const candidateId = (req.user as any)._id;
    const existing = await InterviewSession.findOne({ jobId, candidateId, status: 'active' });
    if (existing) {
      res.json({ success: true, data: { sessionId: existing._id, question: existing.currentQuestion } });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    const requiredSkills: string[] = Array.isArray((job as any).skills) ? (job as any).skills : [];
    const question = await generateNextQuestion({
      jobTitle: (job as any).title || '',
      jobDescription: (job as any).description || '',
      requiredSkills,
      transcript: []
    });

    const session = await InterviewSession.create({ jobId, candidateId, currentQuestion: question, turns: [] });
    res.status(201).json({ success: true, data: { sessionId: session._id, question } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getNextQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // session id
    const session = await InterviewSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }
    res.json({ success: true, data: { question: session.currentQuestion, turns: session.turns, status: session.status } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // session id
    const { answer } = req.body;
    const session = await InterviewSession.findById(id);
    if (!session || session.status !== 'active') {
      res.status(404).json({ success: false, message: 'Session not found or completed' });
      return;
    }

    const currentQ = session.currentQuestion || '';
    const evalRes = await scoreAnswer(currentQ, answer || '');
    session.turns.push({ question: currentQ, answer, score: evalRes.score, notes: evalRes.notes });

    const job = await Job.findById(session.jobId);
    const requiredSkills: string[] = Array.isArray((job as any)?.skills) ? (job as any).skills : [];
    const nextQ = session.turns.length >= session.maxQuestions
      ? null
      : await generateNextQuestion({
          jobTitle: (job as any)?.title || '',
          jobDescription: (job as any)?.description || '',
          requiredSkills,
          transcript: session.turns.map(t => ({ question: t.question, answer: t.answer }))
        });

    session.currentQuestion = nextQ || undefined;
    if (!nextQ) {
      session.status = 'completed';
      
      // Send interview completion email (non-blocking)
      (async () => {
        try {
          const candidate = await User.findById(session.candidateId);
          const jobDoc = await Job.findById(session.jobId);
          
          if (candidate && jobDoc) {
            await notifyCandidateInterviewComplete(
              candidate.email,
              candidate.name || 'Candidate',
              (jobDoc as any).title || 'Unknown Job',
              session._id.toString()
            );
          }
        } catch (e) {
          console.error('Interview completion email error:', e);
        }
      })();
    }
    await session.save();

    res.json({ success: true, data: { nextQuestion: nextQ, score: evalRes.score, notes: evalRes.notes, status: session.status } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Placeholder endpoint for future server-side transcription (e.g., Google STT)
// Accepts multipart/form-data with field 'audio'. Returns a dummy transcript for now.
export const uploadAudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // session id
    const session = await InterviewSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ success: false, message: 'Audio file is required (field: audio)' });
      return;
    }
    // Placeholder transcript – replace with Google STT output later
    const transcript = 'Transcription pending (server-side STT placeholder).';
    res.status(202).json({ success: true, data: { transcript, bytes: file.size } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


