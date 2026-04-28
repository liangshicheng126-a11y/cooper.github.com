import { NextResponse } from "next/server";
import { Resend } from "resend";

type ContactPayload = {
  name?: string;
  email?: string;
  website?: string;
  topic?: string;
  message?: string;
  company?: string;
  startedAt?: number;
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 3;
const ipRequestLog = new Map<string, number[]>();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const website = body.website?.trim() ?? "";
    const topic = body.topic?.trim() ?? "General Inquiry";
    const message = body.message?.trim() ?? "";
    const company = body.company?.trim() ?? "";
    const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
    const elapsed = Date.now() - startedAt;

    // Honeypot: bots often fill hidden fields.
    if (company) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (elapsed > 0 && elapsed < 2500) {
      return NextResponse.json({ error: "Form submitted too quickly." }, { status: 429 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const recent = (ipRequestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "Too many requests. Please wait and retry." }, { status: 429 });
    }
    recent.push(now);
    ipRequestLog.set(ip, recent);

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || "liangshicheng303@126.com";
    const fromEmail = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

    if (!resendApiKey) {
      return NextResponse.json({ error: "Server is not configured for email delivery." }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const subject = `[Portfolio Contact] ${topic} - ${name}`;

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Website/Social: ${website || "-"}`,
        `Topic: ${topic}`,
        "",
        message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
