/**
 * Email Configuration (Nodemailer - Gmail)
 */

import nodemailer from 'nodemailer';
import logger from '../utils/logger.util';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!transporter) {
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    if (!user || !pass) {
      logger.warn('EMAIL_SERVER_USER or EMAIL_SERVER_PASSWORD not configured - email features disabled');
      return null;
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    logger.warn('Email not sent - Nodemailer not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const from = process.env.EMAIL_FROM || 'ESUT Bookshop <noreply@esutbookshop.com>';
    const result = await mailTransporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return { success: true, result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Email sending failed:', message);
    throw new Error('Failed to send email');
  }
}

export async function sendSubAdminWelcomeEmail(
  email: string,
  username: string,
  temporaryPassword: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ESUT Bookshop Admin Panel</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have been added as a Sub-Admin for the ESUT Bookshop management system.</p>
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
            </div>
            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            <p>You can now manage books in the system.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ESUT Bookshop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to ESUT Bookshop Admin Panel',
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetUrl: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF6B6B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${username}</strong>,</p>
            <p>We received a request to reset your password for your ESUT Bookshop account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <p><strong>⚠️ Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 ESUT Bookshop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - ESUT Bookshop',
    html,
  });
}

export async function sendPasswordResetSuccessEmail(
  email: string,
  username: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Password Reset Successful</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${username}</strong>,</p>
            <div class="success">
              <p><strong>Your password has been successfully reset!</strong></p>
            </div>
            <p>You can now log in to your ESUT Bookshop account with your new password.</p>
            <p>If you did not make this change, please contact support immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ESUT Bookshop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Successful - ESUT Bookshop',
    html,
  });
}

