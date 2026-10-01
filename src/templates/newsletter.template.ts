import { baseEmailTemplate } from "./base.template";

export interface INewsletterEmailOptions {
  email: string;
  unsubscribeUrl?: string;
  exploreUrl: string;
}

export const newsletterWelcomeTemplate = ({
  email,
  unsubscribeUrl,
  exploreUrl,
}: INewsletterEmailOptions): { subject: string; html: string } => {
  const subject = "You're subscribed to EcoSpark Hub News! 🌿";

  const content = `
    <h2 style="color: #064E3B; margin-top: 0;">Thanks for subscribing! 🌿</h2>
    <p>We've added <strong>${email}</strong> to our eco-innovators newsletter.</p>
    
    <div class="highlight-box">
      <p style="margin: 0; color: #064E3B; font-weight: 500;">
        You'll receive curated monthly highlights of top community ideas, breakthrough green solutions, and sustainable lifestyle projects directly in your inbox.
      </p>
    </div>

    <p style="text-align: center;">
      <a href="${exploreUrl}" class="btn">Browse Top Ideas</a>
    </p>

    ${
      unsubscribeUrl
        ? `<p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 30px;">
            Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #64748B;">Unsubscribe</a>.
           </p>`
        : ""
    }
  `;

  return {
    subject,
    html: baseEmailTemplate({
      title: subject,
      previewText: "You are now subscribed to the EcoSpark Hub newsletter.",
      content,
    }),
  };
};

export default newsletterWelcomeTemplate;
