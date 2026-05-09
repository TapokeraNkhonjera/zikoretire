import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (status) where.read = status === 'read';

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.notification.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Admin notification management error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, notificationIds, bulkData } = body;

    if (action === 'bulkDelete') {
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json(
          { success: false, message: "Valid notification IDs required" },
          { status: 400 }
        );
      }

      await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds }
        }
      });

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notifications deleted`
      });
    }

    if (action === 'bulkMarkRead') {
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json(
          { success: false, message: "Valid notification IDs required" },
          { status: 400 }
        );
      }

      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds }
        },
        data: { read: true, readAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notifications marked as read`
      });
    }

    if (action === 'createBulk') {
      if (!bulkData || !Array.isArray(bulkData)) {
        return NextResponse.json(
          { success: false, message: "Valid bulk data required" },
          { status: 400 }
        );
      }

      const notifications = bulkData.map(data => ({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'admin_broadcast',
        read: false,
        linkUrl: data.linkUrl,
        linkText: data.linkText,
        priority: data.priority || 'medium',
        metadata: {
          bulkNotification: true,
          adminId: session.user.id,
          adminName: session.user.name,
          campaignId: data.campaignId,
          targetAudience: data.targetAudience
        }
      }));

      await prisma.notification.createMany({
        data: notifications
      });

      return NextResponse.json({
        success: true,
        message: `${notifications.length} notifications created`
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Admin notification management error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 }
    );
  }
}
