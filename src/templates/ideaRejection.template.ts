import { baseEmailTemplate } from "./base.template";

export interface IIdeaRejectionOptions {
  authorName: string;
  ideaTitle: string;
  feedback: string;
  editUrl: string;
}

export const ideaRejectionTemplate = ({
  authorName,
  ideaTitle,
  feedback,
  editUrl,
}: IIdeaRejectionOptions): { subject: string; html: string } => {
  const subject = `Update regarding your idea: "${ideaTitle}"`;

  const content = `
    <h2 style="color: #0F172A; margin-top: 0;">Hello ${authorName},</h2>
    <p>Thank you for submitting your sustainability idea <strong>"${ideaTitle}"</strong> to EcoSpark Hub.</p>
    <p>After review, our moderation team determined that your idea requires revisions before it can be published.</p>

    <div class="warning-box">
      <h3 style="color: #B45309; margin: 0 0 8px 0; font-size: 16px;">Moderator Feedback:</h3>
      <p style="margin: 0; font-style: italic; color: #78350F; white-space: pre-wrap;">"${feedback}"</p>
    </div>

    <p>Don't be discouraged! You can easily update your description, problem statement, or proposed solution addressing the feedback and resubmit it for review.</p>

    <p style="text-align: center;">
      <a href="${editUrl}" class="btn">Edit & Resubmit Idea</a>
    </p>

    <p style="color: #64748B; font-size: 14px;">We appreciate your dedication to sharing high-quality environmental initiatives.</p>
  `;

  return {
    subject,
    html: baseEmailTemplate({
      title: subject,
      previewText: `Revisions requested for your idea: ${ideaTitle}`,
      content,
    }),
  };
};

export default ideaRejectionTemplate;
