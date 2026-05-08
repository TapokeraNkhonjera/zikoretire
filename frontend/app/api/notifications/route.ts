import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const where = {
      userId: session.user.id,
      ...(unreadOnly ? { read: false } : {})
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        linkUrl: true,
        linkText: true,
        createdAt: true,
        readAt: true
      }
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length
      }
    })
  } catch (error) {
    console.error("NOTIFICATIONS GET ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, notificationId, markAllRead } = body

    if (action === 'markRead') {
      // Mark specific notification as read
      if (!notificationId) {
        return NextResponse.json(
          { success: false, message: "Notification ID required" },
          { status: 400 }
        )
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true, readAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        message: "Notification marked as read"
      })
    } else if (action === 'markAllRead') {
      // Mark all notifications as read for this user
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: { read: true, readAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read"
      })
    } else if (action === 'delete') {
      // Delete specific notification
      if (!notificationId) {
        return NextResponse.json(
          { success: false, message: "Notification ID required" },
          { status: 400 }
        )
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      })

      return NextResponse.json({
        success: true,
        message: "Notification deleted"
      })
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("NOTIFICATIONS POST ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to process notification action" },
      { status: 500 }
    )
  }
}
