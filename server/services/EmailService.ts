import nodemailer from 'nodemailer';

function parseFromAddress(fromStr: string | undefined, defaultEmail: string): { name: string; email: string } {
  if (!fromStr) {
    return { name: "VeloWager Pro Security", email: defaultEmail };
  }
  // Remove any backslashes or escaped quotes that could be introduced by environment variables
  const cleanStr = fromStr.replace(/\\"/g, '"').replace(/\\/g, '').trim();
  
  // Try to find an email in angle brackets: e.g. "Name" <email@domain.com>
  const emailMatch = cleanStr.match(/<([^>]+)>/);
  if (emailMatch && emailMatch[1]) {
    const email = emailMatch[1].trim();
    // Get the name part before the angle brackets
    const namePart = cleanStr.split('<')[0].replace(/"/g, '').trim();
    return {
      name: namePart || "VeloWager Pro Security",
      email: email
    };
  }
  
  // If no angle brackets, check if it's just a plain email address
  if (cleanStr.includes('@')) {
    return { name: "VeloWager Pro Security", email: cleanStr };
  }
  
  return { name: "VeloWager Pro Security", email: defaultEmail };
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    // Avoid running initTransporter at module load time to prevent ESM hoisting issues with dotenv
  }

  private ensureConfigured(): boolean {
    if (this.isConfigured) {
      return true;
    }
    this.initTransporter();
    return this.isConfigured;
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      const isSecure = process.env.SMTP_SECURE === 'true' || port === '465';
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: isSecure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      this.isConfigured = true;
    } else {
      console.warn(
        `[EmailService] SMTP credentials not fully configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS missing). ` +
        `Emails cannot be dispatched.`
      );
    }
  }

  /**
   * Sends a 6-digit OTP verification code via email.
   */
  async sendOtpEmail(toEmail: string, otp: string, purpose: 'signup' | 'forgot' = 'signup'): Promise<{ success: boolean; error?: string }> {
    this.ensureConfigured();

    const purposeTitle = purpose === 'signup' ? 'Create Your Account' : 'Reset Your Password';
    const purposeText = purpose === 'signup' 
      ? 'Thank you for choosing VeloWager Pro. Use the following verification code to complete your signup process.'
      : 'We received a request to reset your VeloWager Pro account password. Use the following verification code to authenticate this change.';

    const fromAddress = process.env.SMTP_FROM || `"VeloWager Pro Security" <no-reply@velowager.com>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VeloWager Pro Security Verification</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b0e11;
            color: #e3e8ef;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            background-color: #12161b;
            border: 1px solid #2d3139;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #1c222b;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #a855f7;
            text-transform: uppercase;
          }
          .title {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            margin-top: 12px;
            margin-bottom: 0;
          }
          .content {
            font-size: 14px;
            line-height: 1.6;
            color: #a0aec0;
            margin-bottom: 24px;
          }
          .otp-container {
            background-color: #0b0e11;
            border: 1px dashed #a855f7;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
          }
          .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 8px;
            margin: 0;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #4a5568;
            border-top: 1px solid #1c222b;
            padding-top: 24px;
            margin-top: 32px;
          }
          .footer p {
            margin: 4px 0;
          }
          .warning {
            color: #e2e8f0;
            font-size: 12px;
            background-color: rgba(168, 85, 247, 0.12);
            border-left: 3px solid #a855f7;
            padding: 12px;
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">VeloWager Pro</div>
            <div class="title">${purposeTitle}</div>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>${purposeText}</p>
            
            <div class="otp-container">
              <p style="margin-top: 0; margin-bottom: 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #a855f7;">Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin-top: 8px; margin-bottom: 0; font-size: 11px; color: #718096;">Code expires in 5 minutes</p>
            </div>

            <div class="warning">
              <strong>Security Alert:</strong> Never share this verification code with anyone. Our support staff will never request this code.
            </div>
          </div>
          <div class="footer">
            <p>This email was automatically generated by the VeloWager Pro platform.</p>
            <p>&copy; 2026 VeloWager Pro. All Rights Reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (!this.isConfigured) {
      console.error(`[EmailService] Attempted to send email to ${toEmail}, but SMTP is not configured!`);
      return { success: false, error: 'SMTP or Brevo API is not configured on the server. Please check .env configuration.' };
    }

    // If SMTP_PASS starts with 'xkeysib-', it's a Brevo API Key. Let's send via Brevo's REST API directly.
    // This is 100% reliable, fast, and completely bypasses SMTP relay AUTH/port blocking or IP whitelist issues on SMTP.
    if (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('xkeysib-')) {
      try {
        const rawFrom = process.env.SMTP_FROM || `"VeloWager Pro Security" <no-reply@velowager.com>`;
        const senderInfo = parseFromAddress(rawFrom, process.env.SMTP_USER || "no-reply@velowager.com");

        // If the fallback sender address is unverified but we have a custom SMTP_USER,
        // use SMTP_USER instead (only if it is not the default smtp-brevo.com login)
        if (
          senderInfo.email === "no-reply@velowager.com" &&
          process.env.SMTP_USER &&
          process.env.SMTP_USER.includes('@') &&
          !process.env.SMTP_USER.includes('smtp-brevo.com')
        ) {
          senderInfo.email = process.env.SMTP_USER;
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": process.env.SMTP_PASS,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            sender: {
              name: senderInfo.name,
              email: senderInfo.email
            },
            to: [
              {
                email: toEmail,
                name: toEmail.split('@')[0]
              }
            ],
            subject: `[VeloWager Pro] Your Security OTP Code: ${otp}`,
            htmlContent: htmlContent,
            textContent: `Hello, use the following security verification code to authenticate: ${otp}. It will expire in 5 minutes. Please do not share this code with anyone.`
          })
        });

        if (response.status === 201 || response.status === 200) {
          return { success: true };
        } else {
          const errMsg = await response.text();
          console.error(`[EmailService] Brevo REST API send failed with status ${response.status}:`, errMsg);
          return { success: false, error: `Brevo API returned status ${response.status}` };
        }
      } catch (err: any) {
        console.error(`[EmailService] Brevo API sending error:`, err);
        return { success: false, error: err.message || 'Brevo API transport failure' };
      }
    }

    if (!this.transporter) {
      return { success: false, error: 'SMTP transporter not initialized' };
    }

    try {
      await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[VeloWager Pro] Your Security OTP Code: ${otp}`,
        html: htmlContent,
        text: `Hello, use the following security verification code to authenticate: ${otp}. It will expire in 5 minutes. Please do not share this code with anyone.`
      });
      return { success: true };
    } catch (err: any) {
      console.error(`[EmailService] Error occurred while sending email to ${toEmail}:`, err);
      // Fallback so developers do not get blocked in sandbox environments
      return { success: false, error: err.message || 'SMTP delivery failure' };
    }
  }
}

export const emailService = new EmailService();
