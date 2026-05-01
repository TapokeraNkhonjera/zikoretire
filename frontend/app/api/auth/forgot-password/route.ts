import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {

  try {

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // 🔍 1. CHECK USER EXISTS
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // IMPORTANT: don't reveal existence
      return NextResponse.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    // 🔑 2. GENERATE TOKEN
// Generate RAW token (for URL)
const rawToken = crypto.randomUUID();

// Hash token (for DB security)
const hashedToken = crypto
  .createHash("sha256")
  .update(rawToken)
  .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt,
      },
    });



    // 📧 4. SEND EMAIL (WITH ERROR LOGGING)
    const emailResult = await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL!,
  to: "tapotandane@gmail.com",
  subject: "Test Reset Email",
  html: "<p>This works in test mode</p>",
});

    console.log("EMAIL RESULT:", emailResult);

    return NextResponse.json({
      message: "If the email exists, a reset link has been sent",
    });

  } catch (error) {

    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      { message: "Server error sending email" },
      { status: 500 }
    );
  }
}