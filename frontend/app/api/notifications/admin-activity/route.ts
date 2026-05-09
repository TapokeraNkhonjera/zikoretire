import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { activity, details, targetUserId } = body;

    // Create admin activity notification
    const notificationData: any = {
      userId: targetUserId || session.user.id,
      title: activity.title,
      message: activity.message,
      type: 'admin_activity',
      read: false,
      linkUrl: activity.linkUrl,
      linkText: activity.linkText,
      priority: activity.priority || "medium",
      metadata: {
        activityType: activity.type,
        adminId: session.user.id,
        adminName: session.user.name,
        details: details,
        timestamp: new Date().toISOString()
      }
    };

    const notification = await prisma.notification.create({
      data: notificationData
    });

    return NextResponse.json({
      success: true,
      data: {
        notificationId: notification.id,
        message: "Admin activity notification created"
      }
    });

  } catch (error) {
    console.error("Admin activity notification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create admin notification" },
      { status: 500 }
    );
  }
}

// Predefined admin activity types
export const ADMIN_ACTIVITIES = {
  USER_REGISTRATION: {
    type: "user_registration",
    title: "👤 New User Registration",
    message: "A new user has registered on the platform",
    priority: "medium",
    linkUrl: "/admin/users",
    linkText: "View Users"
  },
  SYSTEM_UPDATE: {
    type: "system_update",
    title: "🔄 System Update",
    message: "System maintenance or update completed",
    priority: "high",
    linkUrl: "/admin/system",
    linkText: "View Details"
  },
  SECURITY_ALERT: {
    type: "security_alert",
    title: "🚨 Security Alert",
    message: "Suspicious activity detected requiring attention",
    priority: "high",
    linkUrl: "/admin/security",
    linkText: "Review Security"
  },
  PERFORMANCE_ISSUE: {
    type: "performance_issue",
    title: "⚠️ Performance Alert",
    message: "System performance metrics require attention",
    priority: "medium",
    linkUrl: "/admin/analytics",
    linkText: "View Analytics"
  },
  DATA_SYNC: {
    type: "data_sync",
    title: "📊 Data Sync Complete",
    message: "Database synchronization process completed",
    priority: "low",
    linkUrl: "/admin/data",
    linkText: "View Data"
  },
  BACKUP_COMPLETE: {
    type: "backup_complete",
    title: "💾 Backup Complete",
    message: "System backup process completed successfully",
    priority: "low",
    linkUrl: "/admin/backup",
    linkText: "View Backups"
  },
  USER_SUSPENSION: {
    type: "user_suspension",
    title: "🚫 User Account Suspended",
    message: "User account has been suspended due to policy violation",
    priority: "high",
    linkUrl: "/admin/users",
    linkText: "Review User"
  },
  ML_MODEL_UPDATE: {
    type: "ml_model_update",
    title: "🤖 ML Model Updated",
    message: "Machine learning models have been updated with new training data",
    priority: "medium",
    linkUrl: "/admin/ml",
    linkText: "View Models"
  }
};
