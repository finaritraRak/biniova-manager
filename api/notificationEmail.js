// api/notificationEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotificationEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to,
    subject,
    html
  });
}
