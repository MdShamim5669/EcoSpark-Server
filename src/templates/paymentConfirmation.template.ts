import { baseEmailTemplate } from "./base.template";

export interface IPaymentConfirmationOptions {
  name: string;
  transactionId: string;
  ideaTitle: string;
  amount: number | string;
  ideaUrl: string;
  date?: string;
}

export const paymentConfirmationTemplate = ({
  name,
  transactionId,
  ideaTitle,
  amount,
  ideaUrl,
  date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
}: IPaymentConfirmationOptions): { subject: string; html: string } => {
  const subject = `Payment Confirmed: Access Unlocked for "${ideaTitle}"`;

  const content = `
    <h2 style="color: #0F172A; margin-top: 0;">Payment Received! 🎉</h2>
    <p>Hi ${name},</p>
    <p>Thank you for supporting sustainability on EcoSpark Hub! Your payment has been verified, and the full content for <strong>${ideaTitle}</strong> is now completely unlocked.</p>
    
    <div class="meta-box">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Transaction ID:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; font-family: monospace;">${transactionId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Idea:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600;">${ideaTitle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Amount Paid:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #059669;">৳ ${Number(amount).toFixed(2)} BDT</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Date:</td>
          <td style="padding: 6px 0; text-align: right; color: #334155;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Status:</td>
          <td style="padding: 6px 0; text-align: right; color: #10B981; font-weight: 600;">PAID</td>
        </tr>
      </table>
    </div>

    <p style="text-align: center;">
      <a href="${ideaUrl}" class="btn">View Full Idea Now</a>
    </p>

    <p style="font-size: 13px; color: #64748B;">You can also access this idea anytime in your profile under <em>Purchase History</em>.</p>
  `;

  return {
    subject,
    html: baseEmailTemplate({
      title: subject,
      previewText: `Payment confirmed for ${ideaTitle} (৳${amount})`,
      content,
    }),
  };
};

export default paymentConfirmationTemplate;
