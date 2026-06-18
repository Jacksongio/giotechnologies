import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => (byte % 10).toString()).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "The Giordanos <support@giotech.ai>",
      to: [email],
      subject: "Your Giordanos password reset code",
      text: `Your password reset code is ${token}\n\nEnter this code to set a new password. It expires shortly. If you didn't request this, you can safely ignore this email.\n\nThe Giordanos Family Film Library`,
      html: resetEmailHtml(token),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

function resetEmailHtml(token: string) {
  const digits = token
    .split("")
    .map(
      (d) =>
        `<td style="padding:0 4px;"><div style="width:44px;height:56px;line-height:56px;background-color:#faf6f0;border:1px solid #e7ddd0;border-radius:12px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:600;color:#1c1917;text-align:center;">${d}</div></td>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4efe8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4efe8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ebe3d7;">
            <tr>
              <td style="background-color:#1c1917;padding:36px 40px;text-align:center;">
                <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c89b6a;">Est. 1999</p>
                <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#ffffff;">The Giordanos</h1>
                <p style="margin:6px 0 0;font-family:'Courier New',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.55);">Family Film Library</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1c1917;">Reset your password</h2>
                <p style="margin:0 0 28px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#6b6356;">Use the code below to set a new password and get back to the family archive.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 28px;">
                  <tr>${digits}</tr>
                </table>
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#8a8175;text-align:center;">This code expires shortly. If you didn't request a reset, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#faf6f0;padding:24px 40px;text-align:center;border-top:1px solid #ebe3d7;">
                <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#b3a994;">Made with love, kept forever</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
