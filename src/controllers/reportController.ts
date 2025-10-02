import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Application from '../models/Application';
import InterviewSession from '../models/InterviewSession';
import Job from '../models/Job';

/**
 * Generate a comprehensive recruiter report for an application
 * GET /api/reports/recruiter/:applicationId
 */
export const getRecruiterReport = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;

    // Fetch application with populated job and candidate
    const application = await Application.findById(applicationId)
      .populate('job', 'title description requirements')
      .populate('candidate', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Fetch interview session if exists
    const interviewSession = await InterviewSession.findOne({ 
      application: applicationId 
    }).sort({ createdAt: -1 });

    // Calculate aggregate scores
    const resumeScore = application.matchScore || application.score || 0;
    let interviewScore = 0;
    let interviewNotes: string[] = [];

    if (interviewSession && interviewSession.turns.length > 0) {
      const scoredTurns = interviewSession.turns.filter(t => t.score !== undefined);
      if (scoredTurns.length > 0) {
        interviewScore = scoredTurns.reduce((sum, t) => sum + (t.score || 0), 0) / scoredTurns.length;
        interviewScore = Math.round(interviewScore * 10); // Convert to 0-100 scale
      }
      interviewNotes = interviewSession.turns
        .filter(t => t.notes)
        .map(t => `Q: ${t.question}\nNotes: ${t.notes}`);
    }

    // Overall recommendation
    const overallScore = (resumeScore * 0.4 + interviewScore * 0.6);
    let recommendation = 'Reject';
    if (overallScore >= 75) recommendation = 'Strong Hire';
    else if (overallScore >= 60) recommendation = 'Hire';
    else if (overallScore >= 45) recommendation = 'Maybe';

    const report = {
      candidate: {
        name: (application.candidate as any)?.name || 'Unknown',
        email: (application.candidate as any)?.email || 'Unknown',
        appliedAt: application.appliedAt
      },
      job: {
        title: (application.job as any)?.title || 'Unknown',
        id: application.job
      },
      scores: {
        resume: resumeScore,
        interview: interviewScore,
        overall: Math.round(overallScore)
      },
      resumeAnalysis: {
        summary: application.analysisSummary || 'No analysis available',
        extractedSkills: application.extractedSkills || []
      },
      interviewSummary: {
        completedTurns: interviewSession?.turns.length || 0,
        status: interviewSession?.status || 'not_started',
        notes: interviewNotes
      },
      recommendation,
      status: application.status
    };

    res.json({
      success: true,
      data: { report }
    });
  } catch (error: any) {
    console.error('Error generating recruiter report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Generate a candidate feedback report
 * GET /api/reports/candidate/:applicationId
 */
export const getCandidateFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const candidateId = req.user?.userId;

    const application = await Application.findById(applicationId)
      .populate('job', 'title description');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Ensure candidate can only see their own feedback
    if (application.candidate.toString() !== candidateId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const interviewSession = await InterviewSession.findOne({ 
      application: applicationId 
    }).sort({ createdAt: -1 });

    // Calculate strengths and areas to improve based on interview
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (interviewSession && interviewSession.turns.length > 0) {
      interviewSession.turns.forEach(turn => {
        if (turn.score && turn.score >= 7) {
          strengths.push(`Strong answer on: ${turn.question.substring(0, 50)}...`);
        } else if (turn.score && turn.score < 6) {
          improvements.push(`Could improve on: ${turn.question.substring(0, 50)}...`);
        }
      });
    }

    // Default feedback if no interview data
    if (strengths.length === 0) {
      strengths.push('Successfully submitted application');
      strengths.push('Resume matched key job requirements');
    }

    if (improvements.length === 0) {
      improvements.push('Practice explaining technical concepts with specific examples');
      improvements.push('Prepare quantifiable metrics for past projects');
    }

    const feedback = {
      job: {
        title: (application.job as any)?.title || 'Unknown'
      },
      status: application.status,
      matchScore: application.matchScore || application.score || 0,
      strengths,
      areasToImprove: improvements,
      interviewCompleted: interviewSession?.status === 'completed',
      nextSteps: [
        'Review feedback and practice weak areas',
        'Research the company culture and recent news',
        'Prepare questions for the hiring team'
      ]
    };

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (error: any) {
    console.error('Error generating candidate feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

