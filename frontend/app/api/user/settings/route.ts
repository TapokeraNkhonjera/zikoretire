import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get user settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { type, ...updateData } = data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle different update types
    switch (type) {
      case "profile":
        // Update name and email
        if (updateData.email && updateData.email !== user.email) {
          // Check if email is already taken
          const existingUser = await prisma.user.findUnique({
            where: { email: updateData.email }
          });
          
          if (existingUser) {
            return NextResponse.json(
              { error: "Email already in use" },
              { status: 400 }
            );
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id: session.user.id },
          data: {
            name: updateData.name || user.name,
            email: updateData.email || user.email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        });

        return NextResponse.json({
          success: true,
          data: updatedUser,
          message: "Profile updated successfully"
        });

      case "password":
        // Change password
        const { currentPassword, newPassword } = updateData;
        
        if (!currentPassword || !newPassword) {
          return NextResponse.json(
            { error: "Current password and new password are required" },
            { status: 400 }
          );
        }

        if (newPassword.length < 8) {
          return NextResponse.json(
            { error: "New password must be at least 8 characters long" },
            { status: 400 }
          );
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 }
          );
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
          where: { id: session.user.id },
          data: { password: hashedNewPassword }
        });

        return NextResponse.json({
          success: true,
          message: "Password changed successfully"
        });

      case "avatar":
        // Update avatar URL
        if (!updateData.avatarUrl) {
          return NextResponse.json(
            { error: "Avatar URL is required" },
            { status: 400 }
          );
        }

        const userWithAvatar = await prisma.user.update({
          where: { id: session.user.id },
          data: { image: updateData.avatarUrl },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        });

        return NextResponse.json({
          success: true,
          data: userWithAvatar,
          message: "Avatar updated successfully"
        });

      default:
        return NextResponse.json(
          { error: "Invalid update type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Update user settings error:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
