// Production configuration
export const productionConfig = {
  // Database
  mongoUri: process.env.MONGO_URI,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'production',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN,

  // File Upload
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),

  // Security
  bcryptRounds: 12,

  // Rate Limiting
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 100,
};

export default productionConfig;
