import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewTurn {
  question: string;
  answer?: string;
  score?: number; // 0-10
  notes?: string; // brief evaluator notes
}

export interface IInterviewSession extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  status: 'active' | 'completed';
  turns: IInterviewTurn[];
  currentQuestion?: string;
  maxQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewTurnSchema = new Schema<IInterviewTurn>({
  question: { type: String, required: true, trim: true },
  answer: { type: String, trim: true },
  score: { type: Number, min: 0, max: 10 },
  notes: { type: String, trim: true, maxlength: 1000 }
});

const InterviewSessionSchema = new Schema<IInterviewSession>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  turns: { type: [InterviewTurnSchema], default: [] },
  currentQuestion: { type: String, trim: true },
  maxQuestions: { type: Number, default: 8, min: 1, max: 20 }
}, { timestamps: true });

InterviewSessionSchema.index({ candidateId: 1, jobId: 1, status: 1 });

export default mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);


