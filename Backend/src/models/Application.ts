import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  resumeUrl: string;
  coverLetter?: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  score?: number;
  skills: string[];
  experience: string;
  education: string;
  notes?: string;
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate ID is required']
  },
  resumeUrl: {
    type: String,
    required: [true, 'Resume URL is required']
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    trim: true
  },
  education: {
    type: String,
    required: [true, 'Education is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Indexes for better query performance
ApplicationSchema.index({ candidateId: 1 });
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ appliedAt: -1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
