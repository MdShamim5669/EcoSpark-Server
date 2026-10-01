import { baseEmailTemplate } from "./base.template";

export interface IPasswordResetOptions {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export const passwordResetTemplate = ({
  name,
  resetUrl,
  expiresInMinutes = 15,
}: IPasswordResetOptions): { subject: string; html: string } => {
  const subject = "Reset Your EcoSpark Hub Password 🔐";

  const content = `
    <h2 style="color: #0F172A; margin-top: 0;">Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your EcoSpark Hub account. Click the button below to set a new password:</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="btn" style="background-color: #0F172A;">Reset Password</a>
    </p>

    <div class="warning-box">
      <p style="margin: 0; font-size: 13px; color: #92400E;">
        ⚠️ This password reset link is valid for <strong>${expiresInMinutes} minutes</strong>. If you did not request this, please disregard this email or contact support if you suspect unauthorized access.
      </p>
    </div>
  `;

  return {
    subject,
    html: baseEmailTemplate({
      title: subject,
      previewText: "Reset your EcoSpark Hub password",
      content,
    }),
  };
};

export default passwordResetTemplate;
