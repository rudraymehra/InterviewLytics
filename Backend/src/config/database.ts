import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const mongoURI = process.env.MONGO_URI || (!isProd ? 'mongodb://localhost:27017/interviewlytics' : '');
    if (!mongoURI) {
      throw new Error('MONGO_URI is required in production environment');
    }
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
