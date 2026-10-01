import { baseEmailTemplate } from "./base.template";

export interface IWelcomeEmailOptions {
  name: string;
  loginUrl: string;
}

export const welcomeEmailTemplate = ({
  name,
  loginUrl,
}: IWelcomeEmailOptions): { subject: string; html: string } => {
  const subject = "Welcome to EcoSpark Hub 🌱 - Share & Discover Green Innovations";

  const content = `
    <h2 style="color: #0F172A; margin-top: 0;">Welcome aboard, ${name}!</h2>
    <p>We are thrilled to welcome you to the <strong>EcoSpark Hub</strong> community — the platform dedicated to accelerating eco-friendly ideas and sustainability innovations.</p>
    
    <div class="highlight-box">
      <h3 style="color: #064E3B; margin-top: 0; font-size: 16px;">What you can do on EcoSpark Hub:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #334155;">
        <li><strong>Share Ideas:</strong> Submit your sustainability solutions for admin review.</li>
        <li><strong>Community Voting:</strong> Upvote and downvote ideas you believe in.</li>
        <li><strong>Discussions:</strong> Comment and collaborate with fellow environmentalists.</li>
        <li><strong>Premium Access:</strong> Explore comprehensive implementation guides for paid ideas.</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="${loginUrl}" class="btn">Explore Green Ideas</a>
    </p>

    <p style="color: #64748B; font-size: 14px;">Together, every small idea sparks a greener future.</p>
  `;

  return {
    subject,
    html: baseEmailTemplate({
      title: subject,
      previewText: `Welcome to EcoSpark Hub, ${name}!`,
      content,
    }),
  };
};

export default welcomeEmailTemplate;
