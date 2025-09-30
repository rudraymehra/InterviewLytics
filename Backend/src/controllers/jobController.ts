import { Request, Response } from 'express';
import Job, { IJob } from '../models/Job';
import Application from '../models/Application';
import { AuthRequest } from '../middleware/authMiddleware';

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.user._id
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error: any) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, type, location, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location as string, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { skills: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const jobs = await Job.find(filter)
      .populate('createdBy', 'name company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('createdBy', 'name company');
    
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error: any) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to update it'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error: any) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await Job.findOneAndDelete({ _id: id, createdBy: req.user._id });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to delete it'
      });
      return;
    }

    // Also delete all applications for this job
    await Application.deleteMany({ jobId: id });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter: any = { createdBy: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
