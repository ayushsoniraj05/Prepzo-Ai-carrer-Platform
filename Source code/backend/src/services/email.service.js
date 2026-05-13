import dotenv from 'dotenv';

dotenv.config();

/**
 * Send OTP via Email (Brevo REST API over HTTP)
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit one-time password
 * @param {string} name - Student name (optional)
 */
export const sendEmailOTP = async (email, otp, name = 'Student') => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('[Brevo API] Missing BREVO_API_KEY env var.');
      return { success: false, error: 'Email configuration missing on server.' };
    }

    const senderEmail = process.env.EMAIL_FROM || 'prepzo.admin@gmail.com';
    const subject = `Your Prepzo AI Verification Code: ${otp}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; padding: 40px; background-color: #0a0c10; border: 1px solid #1a1f2e; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #ffffff; margin: 0; }
          .logo span { color: #3b82f6; }
          .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #64748b; margin-top: 8px; }
          .content { text-align: center; margin-bottom: 40px; }
          .greeting { font-size: 16px; color: #cbd5e1; margin-bottom: 24px; }
          .otp-container { background-color: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: 24px; display: inline-block; margin-bottom: 24px; }
          .otp { font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #60a5fa; margin: 0; font-family: monospace; }
          .warning { font-size: 12px; color: #475569; }
          .footer { text-align: center; font-size: 12px; color: #334155; border-top: 1px solid #1e293b; padding-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">PREPZO<span>AI</span></h1>
            <div class="tagline">Career Intelligence Protocol</div>
          </div>
          <div class="content">
            <div class="greeting">Hello ${name}, your verification code is:</div>
            <div class="otp-container">
              <div class="otp">${otp}</div>
            </div>
            <div class="warning">This code will expire in 10 minutes. Do not share this code with anyone.</div>
          </div>
          <div class="footer">
            &copy; 2026 Prepzo AI. All Rights Reserved.<br>
            Designed for the next generation of engineers.
          </div>
        </div>
      </body>
      </html>
    `;

    // Send via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Prepzo AI', email: senderEmail },
        to: [{ email: email, name: name }],
        subject: subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Brevo API');
    }

    console.log('[Brevo API] OTP email sent successfully to:', email, 'MessageId:', data.messageId);
    return { success: true, data };
  } catch (err) {
    console.error('[Brevo API] Error details:', err.message);
    return { success: false, error: err.message };
  }
};

export default {
  sendEmailOTP,
};
