export interface IBaseEmailOptions {
  title: string;
  previewText?: string;
  content: string;
}

/**
 * Base email layout matching EcoSpark Hub Design System
 * Primary: Emerald (#059669), Background: Slate-50 (#F8FAFC)
 */
export const baseEmailTemplate = ({
  title,
  previewText = "EcoSpark Hub Notification",
  content,
}: IBaseEmailOptions): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #E2E8F0;
    }
    .header {
      background: linear-gradient(135deg, #064E3B 0%, #059669 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .logo {
      font-size: 26px;
      font-weight: 700;
      color: #FFFFFF;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #A7F3D0;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .footer {
      background-color: #F1F5F9;
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #64748B;
      border-top: 1px solid #E2E8F0;
    }
    .footer a {
      color: #059669;
      text-decoration: none;
    }
    .btn {
      display: inline-block;
      background-color: #059669;
      color: #FFFFFF !important;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .btn:hover {
      background-color: #047857;
    }
    .meta-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .highlight-box {
      background-color: #ECFDF5;
      border-left: 4px solid #10B981;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
    .warning-box {
      background-color: #FFFBEB;
      border-left: 4px solid #F59E0B;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${previewText}
  </div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="https://ecosparkhub.com" class="logo">🌱 EcoSpark <span>Hub</span></a>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} EcoSpark Hub. Empowering eco-innovations and sustainable ideas worldwide.</p>
        <p>If you did not make this request, you can safely ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export default baseEmailTemplate;
