import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {

  try {

    const { token, password } =
      await req.json();

    if (!token || !password) {

      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );

    }

const hashedToken = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

    // Find token
const resetToken =
  await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

    if (!resetToken) {

      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );

    }

    // Check expiry
    if (resetToken.expiresAt < new Date()) {

      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      );

    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Update password
    await prisma.user.update({

      where: {
        email: resetToken.email,
      },

      data: {
        password: hashedPassword,
      },

    });

    // Delete token
    await prisma.passwordResetToken.delete({

      where: {
        token,
      },

    });

    return NextResponse.json({
      message:
        "Password reset successful",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );

  }

}