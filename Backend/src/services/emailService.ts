/**
 * Email Service for InterviewLytics
 * 
 * This is a placeholder implementation that logs emails to console.
 * In production, integrate with SendGrid, Mailgun, or AWS SES.
 * 
 * To enable real emails:
 * 1. npm install @sendgrid/mail (or nodemailer)
 * 2. Add SENDGRID_API_KEY or SMTP credentials to .env
 * 3. Replace console.log statements with actual email sending
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email (currently logs to console)
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  // TODO: Replace with actual email service
  console.log('📧 Email notification:');
  console.log(`  To: ${options.to}`);
  console.log(`  Subject: ${options.subject}`);
  console.log(`  Body: ${options.text}`);
  console.log('---');

  // Example SendGrid integration (commented out):
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  await sgMail.send({
    to: options.to,
    from: process.env.EMAIL_FROM || 'noreply@interviewlytics.com',
    subject: options.subject,
    text: options.text,
    html: options.html || options.text
  });
  */
};

/**
 * Notify recruiter when a candidate applies
 */
export const notifyRecruiterOfApplication = async (
  recruiterEmail: string,
  candidateName: string,
  jobTitle: string,
  applicationId: string
): Promise<void> => {
  const subject = `New Application: ${candidateName} applied for ${jobTitle}`;
  const text = `
Hello,

A new candidate has applied for your job posting.

Candidate: ${candidateName}
Job: ${jobTitle}

View the application and AI-powered resume analysis:
${process.env.FRONTEND_URL || 'https://your-app.vercel.app'}/recruiter/applicants

Application ID: ${applicationId}

Best regards,
InterviewLytics Team
  `.trim();

  await sendEmail({
    to: recruiterEmail,
    subject,
    text
  });
};

/**
 * Notify candidate when their application is received
 */
export const notifyCandidateApplicationReceived = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string
): Promise<void> => {
  const subject = `Application Received: ${jobTitle}`;
  const text = `
Hi ${candidateName},

Thank you for applying to ${jobTitle}!

We've received your application and our team will review it shortly. You'll receive an update within 3-5 business days.

In the meantime, you can:
- Complete the AI-powered interview (if available)
- Track your application status in your dashboard

View your applications:
${process.env.FRONTEND_URL || 'https://your-app.vercel.app'}/candidate/applications

Good luck!
InterviewLytics Team
  `.trim();

  await sendEmail({
    to: candidateEmail,
    subject,
    text
  });
};

/**
 * Notify candidate when interview is complete
 */
export const notifyCandidateInterviewComplete = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  sessionId: string
): Promise<void> => {
  const subject = `Interview Complete: ${jobTitle}`;
  const text = `
Hi ${candidateName},

You've successfully completed the AI-powered interview for ${jobTitle}!

Your responses have been recorded and the hiring team will review them shortly. You can view your feedback and performance summary here:

${process.env.FRONTEND_URL || 'https://your-app.vercel.app'}/candidate/feedback?sessionId=${sessionId}

What happens next?
- The recruiter will review your interview transcript
- You'll receive a decision within 5-7 business days
- Check your dashboard for status updates

Thank you for your time!
InterviewLytics Team
  `.trim();

  await sendEmail({
    to: candidateEmail,
    subject,
    text
  });
};

/**
 * Notify candidate of application status change
 */
export const notifyCandidateStatusUpdate = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  status: string
): Promise<void> => {
  const statusMessages: Record<string, string> = {
    shortlisted: 'Congratulations! You've been shortlisted for the next round.',
    rejected: 'Thank you for your interest. Unfortunately, we've decided to move forward with other candidates.',
    hired: 'Congratulations! We're excited to extend you an offer!',
    interview_scheduled: 'Your interview has been scheduled. Check your dashboard for details.'
  };

  const message = statusMessages[status] || 'Your application status has been updated.';

  const subject = `Application Update: ${jobTitle}`;
  const text = `
Hi ${candidateName},

${message}

Job: ${jobTitle}
Status: ${status}

View your application:
${process.env.FRONTEND_URL || 'https://your-app.vercel.app'}/candidate/applications

Best regards,
InterviewLytics Team
  `.trim();

  await sendEmail({
    to: candidateEmail,
    subject,
    text
  });
};

export default {
  sendEmail,
  notifyRecruiterOfApplication,
  notifyCandidateApplicationReceived,
  notifyCandidateInterviewComplete,
  notifyCandidateStatusUpdate
};

