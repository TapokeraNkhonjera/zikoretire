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
    const timeframe = searchParams.get('timeframe') || '7d';
    const userId = searchParams.get('userId');

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate
      }
    };

    if (userId) {
      where.userId = userId;
    }

    // Get notification analytics
    const [totalStats, typeStats, priorityStats, engagementStats] = await Promise.all([
      // Total notifications
      prisma.notification.groupBy({
        by: ['type'],
        where: {
          ...where,
          userId: userId ? userId : undefined
        },
        _count: {
          id: true
        }
      }) as any,

      // Type distribution
      prisma.notification.findMany({
        where: {
          ...where,
          userId: userId ? userId : undefined
        },
        select: {
          type: true,
          priority: true,
          read: true,
          createdAt: true
        }
      }) as any,

      // Priority distribution
      prisma.notification.groupBy({
        by: ['priority'],
        where: {
          ...where,
          userId: userId ? userId : undefined
        },
        _count: {
          id: true
        }
      }) as any,

      // Engagement metrics
      prisma.notification.findMany({
        where: {
          ...where,
          userId: userId ? userId : undefined,
          read: true,
          readAt: { not: null }
        },
        select: {
          createdAt: true,
          readAt: true
        }
      }) as any
    ]);

    // Process analytics data
    const analytics = {
      summary: {
        total: Object.values(totalStats).reduce((sum: number, group: any) => sum + (group as any)._count.id, 0),
        types: Object.keys(totalStats).length,
        timeframe,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      },
      types: typeStats.reduce((acc: any, n: any) => {
        const type = n.type;
        if (!acc[type]) {
          acc[type] = { count: 0, read: 0 };
        }
        acc[type].count++;
        if (n.read) (acc[type] as any).read++;
        return acc;
      }, {}),
      priorities: priorityStats.reduce((acc: any, group: any) => {
        const priority = group.priority;
        if (!acc[priority]) {
          acc[priority] = { count: 0, read: 0 };
        }
        acc[priority].count++;
        if (group.read) (acc[priority] as any).read++;
        return acc;
      }, {}),
      engagement: {
        averageTimeToRead: engagementStats.length > 0 
          ? engagementStats.reduce((sum: number, n: any) => {
              const readTime = n.readAt && n.createdAt 
                ? new Date(n.readAt).getTime() - new Date(n.createdAt).getTime()
                : 0;
              return sum + readTime;
            }, 0) / engagementStats.length / 1000 / 60 // Convert to minutes
          : 0,
        readRate: typeStats.filter((n: any) => n.read).length / typeStats.length,
        totalEngaged: typeStats.filter((n: any) => n.read).length
      },
      insights: await generateNotificationInsights(typeStats, timeframe)
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("Notification analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

async function generateNotificationInsights(notifications: any[], timeframe: string) {
  const insights = [];

  // Most active notification type
  const typeCounts: Record<string, number> = notifications.reduce((acc, n: any) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveType = Object.entries(typeCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];

  if (mostActiveType) {
    insights.push({
      type: 'most_active_type',
      title: 'Most Active Notification Type',
      description: `${mostActiveType} accounts for ${typeCounts[mostActiveType]} notifications`,
      recommendation: 'Consider optimizing this notification type for better engagement'
    });
  }

  // Read rate analysis
  const readNotifications = notifications.filter((n: any) => n.read);
  const readRate = readNotifications.length / notifications.length;

  if (readRate < 0.5) {
    insights.push({
      type: 'low_engagement',
      title: 'Low Notification Engagement',
      description: `Only ${Math.round(readRate * 100)}% of notifications are being read`,
      recommendation: 'Review notification content and timing for better user engagement'
    });
  }

  // High priority notifications
  const highPriorityCount = notifications.filter((n: any) => n.priority === 'high').length;
  if (highPriorityCount > notifications.length * 0.3) {
    insights.push({
      type: 'high_priority_volume',
      title: 'High Priority Notification Volume',
      description: `${highPriorityCount} high priority notifications in ${timeframe}`,
      recommendation: 'Consider reviewing urgency criteria for high priority notifications'
    });
  }

  // ML nudge effectiveness
  const mlNudges = notifications.filter((n: any) => n.type === 'ml_nudge');
  if (mlNudges.length > 0) {
    const mlReadRate = mlNudges.filter((n: any) => n.read).length / mlNudges.length;
    insights.push({
      type: 'ml_nudge_effectiveness',
      title: 'ML Nudge Effectiveness',
      description: `${Math.round(mlReadRate * 100)}% of ML nudges are being acted upon`,
      recommendation: mlReadRate > 0.7 ? 'ML nudges are performing well' : 'Consider refining ML nudge algorithms'
    });
  }

  return insights;
}
