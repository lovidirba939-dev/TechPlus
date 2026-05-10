import nodemailer from "nodemailer";
import crypto from "crypto";

export const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const clean = (value) => (value || "").trim().replace(/^"|"$/g, "");
const isHttpUrl = (value) => /^https?:\/\/[^/\s]+/i.test(String(value || "").trim());
const EMAIL_PROVIDER_TIMEOUT_MS = Number(clean(process.env.EMAIL_PROVIDER_TIMEOUT_MS)) || 30000;

const resolveClientUrl = (overrideUrl) => {
  const fromOverride = clean(overrideUrl);
  if (fromOverride && isHttpUrl(fromOverride)) return fromOverride.replace(/\/$/, "");

  const fromClient = clean(process.env.CLIENT_URL);
  if (fromClient && isHttpUrl(fromClient)) return fromClient.replace(/\/$/, "");

  const fromAllowed = clean(process.env.ALLOWED_ORIGINS)
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, "").replace(/\/$/, ""))
    .filter((v) => isHttpUrl(v))
    .find(Boolean);

  return fromAllowed || "http://localhost:5173";
};

const getConfiguredSenderAddress = () => clean(process.env.EMAIL_FROM) || clean(process.env.EMAIL);
const buildFromAddress = () => getConfiguredSenderAddress() || "no-reply@techplus.dev";
const smtpEnabled = () => Boolean(clean(process.env.EMAIL) && clean(process.env.EMAIL_PASS));
const brevoEnabled = () => Boolean(clean(process.env.BREVO_API_KEY) && getConfiguredSenderAddress());

// Build multiple transport strategies to maximize deliverability on cloud
// platforms like Render where some SMTP approaches may fail.
function getTransportConfigs() {
  const auth = {
    user: clean(process.env.EMAIL),
    pass: clean(process.env.EMAIL_PASS)
  };
  const timeouts = {
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  };

  return [
    // Strategy 1: nodemailer built-in 'gmail' service
    { label: "gmail-service", config: { service: "gmail", auth, ...timeouts } },
    // Strategy 2: manual STARTTLS on port 587
    { label: "smtp-587", config: { host: "smtp.gmail.com", port: 587, secure: false, auth, tls: { rejectUnauthorized: false }, ...timeouts } },
    // Strategy 3: direct TLS on port 465
    { label: "smtp-465", config: { host: "smtp.gmail.com", port: 465, secure: true, auth, tls: { rejectUnauthorized: false }, ...timeouts } }
  ];
}

async function sendWithSmtp(mailOptions) {
  const strategies = getTransportConfigs();
  let lastError;

  for (const { label, config } of strategies) {
    const transporter = nodemailer.createTransport(config);
    try {
      console.log(`[Email] Trying ${label}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent via ${label}:`, info.messageId);
      return; // success — stop trying
    } catch (error) {
      console.error(`[Email] ${label} failed:`, error.message);
      lastError = error;
    } finally {
      try { transporter.close(); } catch { /* ignore */ }
    }
  }

  throw lastError;
}

async function sendWithBrevo({ to, subject, html }) {
  const apiKey = clean(process.env.BREVO_API_KEY);
  const senderEmail = getConfiguredSenderAddress();
  const senderName = clean(process.env.EMAIL_FROM_NAME) || "TechPlus";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo config is missing (BREVO_API_KEY + EMAIL_FROM)");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMAIL_PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`Brevo API failed (${response.status}): ${bodyText.slice(0, 180)}`);
    }
    console.log("[Email] Sent via Brevo API");
  } finally {
    clearTimeout(timeout);
  }
}

async function sendEmail(mailOptions) {
  const provider = clean(process.env.EMAIL_PROVIDER).toLowerCase() || "auto";
  let brevoError = null;

  if ((provider === "brevo" || provider === "auto") && brevoEnabled()) {
    try {
      await sendWithBrevo(mailOptions);
      return;
    } catch (error) {
      console.error("[Email] Brevo failed:", error.message);
      brevoError = error;
      if (provider === "brevo") throw error;
    }
  }

  if ((provider === "smtp" || provider === "auto") && smtpEnabled()) {
    try {
      await sendWithSmtp({
        from: `"TechPlus" <${buildFromAddress()}>`,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
      });
      return;
    } catch (smtpError) {
      console.error("[Email] Gmail SMTP failed:", smtpError.message);
      if (brevoError) {
        throw new Error(`Brevo + SMTP failed: ${brevoError.message} | ${smtpError.message}`);
      }
      throw smtpError;
    }
  }

  if (brevoError) throw brevoError;
  throw new Error("No email provider configured. Set SMTP (EMAIL + EMAIL_PASS) or Brevo (BREVO_API_KEY + EMAIL_FROM).");
}

export const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Your OTP - TechPlus",
    html: `
      <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Email Verification</h2>
          <p style="font-size: 16px; color: #666;">Your OTP is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 8px; font-size: 32px;">${otp}</h1>
          <p style="color: #666;">Valid for <b>10 minutes</b> only.</p>
        </div>
      </div>
    `
  });
};

export const sendResetEmail = async (email, resetToken, clientUrlOverride = "") => {
  const resetLink = `${resolveClientUrl(clientUrlOverride)}/password-reset?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: "Password Reset - TechPlus",
    html: `
      <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #666;">Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          <p style="color: #666; margin-top: 20px;">Or copy this link in your browser:</p>
          <p style="color: #4F46E5; word-break: break-all;">${resetLink}</p>
          <p style="color: #666;">This link will expire in <b>30 minutes</b>.</p>
        </div>
      </div>
    `
  });
};
