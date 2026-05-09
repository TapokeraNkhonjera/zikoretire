import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json({
      success: true,
      data: {
        preferences: preferences || {
          emailNotifications: true,
          pushNotifications: true,
          mlNudges: true,
          adminActivities: session.user.role === 'ADMIN',
          categories: {
            success: true,
            warning: true,
            error: true,
            admin_activity: session.user.role === 'ADMIN',
            ml_nudge: true,
            push_notification: true,
            milestone_celebration: true,
            system_update: session.user.role === 'ADMIN',
            security_alert: session.user.role === 'ADMIN'
          },
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          },
          frequency: {
            immediate: true,
            digest: 'daily',
            weekly: 'weekly'
          }
        }
      }
    });

  } catch (error) {
    console.error("Notification preferences error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      emailNotifications, 
      pushNotifications, 
      mlNudges, 
      adminActivities,
      categories,
      quietHours,
      frequency 
    } = body;

    // Update or create notification preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? true,
        mlNudges: mlNudges ?? true,
        adminActivities: adminActivities ?? (session.user.role === 'ADMIN'),
        categories: {
          success: categories?.success ?? true,
          warning: categories?.warning ?? true,
          error: categories?.error ?? true,
          admin_activity: adminActivities ?? (session.user.role === 'ADMIN'),
          ml_nudge: categories?.ml_nudge ?? true,
          push_notification: categories?.push_notification ?? true,
          milestone_celebration: categories?.milestone_celebration ?? true,
          system_update: categories?.system_update ?? (session.user.role === 'ADMIN'),
          security_alert: categories?.security_alert ?? (session.user.role === 'ADMIN')
        },
        quietHours: quietHours ?? {
          enabled: false,
          start: '22:00',
          end: '07:00'
        },
        frequency: {
          immediate: frequency?.immediate ?? true,
          digest: frequency?.digest ?? 'daily',
          weekly: frequency?.weekly ?? 'weekly'
        }
      },
      create: {
        userId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Notification preferences updated",
        preferences
      }
    });

  } catch (error) {
    console.error("Notification preferences error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
