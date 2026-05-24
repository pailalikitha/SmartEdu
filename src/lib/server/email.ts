type WelcomeEmailInput = {
  to: string;
  name: string;
  role: "student" | "parent";
  loginUrl: string;
  email: string;
  tempPassword: string;
  verificationLink?: string;
};

export async function sendWelcomeEmail(
  input: WelcomeEmailInput,
): Promise<{ sent: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      sent: false,
      skipped: true,
      error: "Email not configured (set RESEND_API_KEY and EMAIL_FROM).",
    };
  }

  const roleLabel = input.role === "student" ? "Student" : "Parent";
  const subject = `Welcome to SmartEdu — ${roleLabel} account`;
  const html = `
    <p>Hello ${escapeHtml(input.name)},</p>
    <p>Your SmartEdu ${roleLabel.toLowerCase()} account has been created.</p>
    <ul>
      <li><strong>Login URL:</strong> <a href="${escapeHtml(input.loginUrl)}">${escapeHtml(input.loginUrl)}</a></li>
      <li><strong>Email:</strong> ${escapeHtml(input.email)}</li>
      <li><strong>Temporary password:</strong> ${escapeHtml(input.tempPassword)}</li>
    </ul>
    <p><strong>Important:</strong> You must change your password on first login.</p>
    ${
      input.verificationLink
        ? `<p><a href="${escapeHtml(input.verificationLink)}">Verify your email address</a></p>`
        : ""
    }
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { sent: false, error: body || "Failed to send email" };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
