import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      notifications, 
      scheduleType, 
      recurring, 
      targetAudience 
    } = body;

    // Create scheduled notifications
    const notificationData = notifications.map((notification: any) => ({
      userId: notification.userId || session.user.id,
      title: notification.title,
      message: notification.message,
      type: 'scheduled',
      read: false,
      linkUrl: notification.linkUrl,
      linkText: notification.linkText,
      priority: notification.priority || 'medium',
      scheduledAt: new Date(notification.scheduledAt),
      metadata: {
        scheduledNotification: true,
        scheduleType: scheduleType || 'one_time',
        recurring: recurring || false,
        targetAudience: targetAudience || 'individual',
        createdBy: session.user.id,
        creatorName: session.user.name,
        creatorRole: session.user.role
      }
    }));

    const created = await prisma.notification.createMany({
      data: notificationData
    });

    return NextResponse.json({
      success: true,
      data: {
        scheduledNotifications: (created as any).count || notificationData.length,
        message: "Notifications scheduled successfully"
      }
    });

  } catch (error) {
    console.error("Notification scheduler error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to schedule notifications" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get scheduled notifications 
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        type: 'scheduled',
        ...(status && { read: status === 'active' })
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }) as any[];

    return NextResponse.json({
      success: true,
      data: {
        scheduledNotifications,
        summary: {
          totalScheduled: scheduledNotifications.length,
          nextScheduled: scheduledNotifications[0]?.createdAt
        }
      }
    });

  } catch (error) {
    console.error("Notification scheduler fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch scheduled notifications" },
      { status: 500 }
    );
  }
}
