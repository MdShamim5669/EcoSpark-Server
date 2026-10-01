import { baseEmailTemplate } from "./base.template";

export interface IIdeaApprovalOptions {
  authorName: string;
  ideaTitle: string;
  ideaUrl: string;
  categoryName: string;
}

export const ideaApprovalTemplate = ({
  authorName,
  ideaTitle,
  ideaUrl,
  categoryName,
}: IIdeaApprovalOptions): { subject: string; html: string } => {
  const subject = `Your idea "${ideaTitle}" has been approved! 🚀`;

  const content = `
    <h2 style="color: #064E3B; margin-top: 0;">Congratulations, ${authorName}!</h2>
    <p>Great news! Our moderation team has reviewed and <strong>approved</strong> your sustainability idea:</p>

    <div class="highlight-box">
      <h3 style="color: #047857; margin: 0 0 8px 0; font-size: 18px;">${ideaTitle}</h3>
      <p style="margin: 0; font-size: 14px; color: #475569;">Category: <span style="font-weight: 600;">${categoryName}</span></p>
      <p style="margin: 6px 0 0 0; font-size: 14px; color: #10B981; font-weight: 600;">Status: Approved & Published</p>
    </div>

    <p>Your idea is now visible to the public. Community members can now upvote, downvote, share feedback in comments, and support your project!</p>

    <p style="text-align: center;">
      <a href="${ideaUrl}" class="btn">View Live Idea</a>
    </p>

    <p style="color: #64748B; font-size: 14px;">Thank you for making a tangible impact on our planet.</p>
  `;

  return {
    subject,
    html: baseEmailTemplate({
      title: subject,
      previewText: `Your idea "${ideaTitle}" is now live on EcoSpark Hub!`,
      content,
    }),
  };
};

export default ideaApprovalTemplate;
