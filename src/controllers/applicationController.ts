import { Request, Response } from 'express';
import multer from 'multer';
import Application, { IApplication } from '../models/Application';
import Job from '../models/Job';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';
import { extractTextFromResume, scoreWithGemini } from '../services/aiScoring';
import { notifyRecruiterOfApplication, notifyCandidateApplicationReceived } from '../services/emailService';

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { coverLetter, skills, experience, education } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    // Check if job is active
    if (job.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'This job is not accepting applications'
      });
      return;
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user._id
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
      return;
    }

    // Check if resume was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
      return;
    }

    // Create application
    const applicationData = {
      jobId,
      candidateId: req.user._id,
      resumeUrl: `/uploads/${req.file.filename}`,
      coverLetter,
      skills,
      experience,
      education
    };

    const application = await Application.create(applicationData);

    // Update job applicants count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    // Trigger resume screening (best-effort, non-blocking)
    (async () => {
      try {
        const freshJob = await Job.findById(jobId);
        const requiredSkills: string[] = Array.isArray((freshJob as any)?.skills) ? (freshJob as any).skills : [];
        const resumeText = await extractTextFromResume((application.resumeUrl as string) || '');
        const gemini = await scoreWithGemini(
          resumeText,
          (freshJob as any)?.title || '',
          (freshJob as any)?.description || '',
          requiredSkills
        );
        if (gemini) {
          application.matchScore = gemini.score;
          application.extractedSkills = gemini.skills?.length ? gemini.skills : requiredSkills;
          application.analysisSummary = gemini.summary;
        } else {
          const { score, skills } = keywordScore(resumeText, requiredSkills);
          application.matchScore = score;
          application.extractedSkills = skills;
          application.analysisSummary = `Keyword match score based on ${requiredSkills.length} skills.`;
        }
        await application.save();
      } catch (e) {
        // ignore scoring failures
      }
    })();

    // Send email notifications (non-blocking)
    (async () => {
      try {
        const candidate = await User.findById(req.user._id);
        const recruiter = await User.findById(job.createdBy);
        
        if (candidate && recruiter) {
          await notifyRecruiterOfApplication(
            recruiter.email,
            candidate.name || 'Candidate',
            job.title,
            application._id.toString()
          );
          
          await notifyCandidateApplicationReceived(
            candidate.email,
            candidate.name || 'Candidate',
            job.title
          );
        }
      } catch (e) {
        console.error('Email notification error:', e);
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error: any) {
    console.error('Apply to job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Basic keyword scoring utility
const keywordScore = (resumeText: string, required: string[] = []): { score: number; skills: string[] } => {
  const text = resumeText.toLowerCase();
  let hits = 0;
  const found: string[] = [];
  required.forEach(k => {
    const term = (k || '').toLowerCase();
    if (!term) return;
    if (text.includes(term)) {
      hits += 1;
      found.push(k);
    }
  });
  const score = required.length ? Math.round((hits / required.length) * 100) : 0;
  return { score, skills: found };
};

// Compute resume match score for an application (MVP keyword-based)
export const scoreApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // application id
    const application = await Application.findById(id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    // Extract resume text (supports .txt and .pdf)
    const resumeText = await extractTextFromResume(application.resumeUrl || '');

    const requiredSkills: string[] = Array.isArray((job as any).skills) ? (job as any).skills : [];
    // Try Gemini first when key is present; fallback to keyword
    const gemini = await scoreWithGemini(resumeText, (job as any).title || '', (job as any).description || '', requiredSkills);
    if (gemini) {
      application.matchScore = gemini.score;
      application.extractedSkills = gemini.skills?.length ? gemini.skills : requiredSkills;
      application.analysisSummary = gemini.summary;
    } else {
      const { score, skills } = keywordScore(resumeText, requiredSkills);
      application.matchScore = score;
      application.extractedSkills = skills;
      application.analysisSummary = `Keyword match score based on ${requiredSkills.length} skills.`;
    }
    await application.save();

    res.json({ success: true, data: { matchScore: score, extractedSkills: skills } });
  } catch (error: any) {
    console.error('Score application error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter: any = { candidateId: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const applications = await Application.find(filter)
      .populate('jobId', 'title company location type status')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('jobId', 'title company location type description requirements')
      .populate('candidateId', 'name email phone');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error: any) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Verify that the user owns this job
    const job = await Job.findOne({ _id: jobId, createdBy: req.user._id });
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to view applications'
      });
      return;
    }

    const filter: any = { jobId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const applications = await Application.find(filter)
      .populate('candidateId', 'name email phone')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(id)
      .populate('jobId', 'createdBy title')
      .populate('candidateId', 'name email');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    // Check if user owns the job
    if ((application.jobId as any).createdBy.toString() !== (req.user._id as any).toString()) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this application'
      });
      return;
    }

    const oldStatus = application.status;
    application.status = status;
    if (notes) application.notes = notes;

    await application.save();

    // Send status update notification to candidate (non-blocking)
    if (oldStatus !== status) {
      (async () => {
        try {
          const { notifyCandidateStatusUpdate } = await import('../services/emailService');
          const candidate = application.candidateId as any;
          const job = application.jobId as any;
          
          if (candidate?.email && job?.title) {
            await notifyCandidateStatusUpdate(
              candidate.email,
              candidate.name || 'Candidate',
              job.title,
              status
            );
          }
        } catch (e) {
          console.error('Status notification error:', e);
        }
      })();
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error: any) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
