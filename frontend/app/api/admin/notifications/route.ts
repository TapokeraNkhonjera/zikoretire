import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      // Get notification statistics
      const totalNotifications = await prisma.notification.count()
      const unreadNotifications = await prisma.notification.count({ where: { read: false } })
      const userNotifications = await prisma.notification.count({ where: { type: 'info' } })
      const adminNotifications = await prisma.notification.count({ where: { type: 'admin' } })

      return NextResponse.json({
        success: true,
        data: {
          total: totalNotifications,
          unread: unreadNotifications,
          user: userNotifications,
          admin: adminNotifications
        }
      })
    }

    // Get all notifications for admin view
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total: notifications.length
      }
    })
  } catch (error) {
    console.error("ADMIN NOTIFICATIONS GET ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...notificationData } = body

    if (action === 'create') {
      const { title, message, type, targetRole, isGlobal, linkUrl, linkText, targetUsers } = notificationData

      if (!title || !message || !type) {
        return NextResponse.json(
          { success: false, message: "Title, message, and type are required" },
          { status: 400 }
        )
      }

      if (isGlobal) {
        // Create notification for all users or specific role
        const whereClause = targetRole ? { role: targetRole } : {}
        
        const users = await prisma.user.findMany({
          where: whereClause,
          select: { id: true }
        })

        const notifications = await prisma.notification.createMany({
          data: users.map(user => ({
            userId: user.id,
            title,
            message,
            type,
            isGlobal: true,
            targetRole: targetRole || null,
            linkUrl: linkUrl || null,
            linkText: linkText || null
          }))
        })

        return NextResponse.json({
          success: true,
          data: {
            created: notifications.count,
            message: `Notification sent to ${notifications.count} users`
          }
        })
      } else if (targetUsers && Array.isArray(targetUsers)) {
        // Create notification for specific users
        const notifications = await prisma.notification.createMany({
          data: targetUsers.map(userId => ({
            userId,
            title,
            message,
            type,
            isGlobal: false,
            linkUrl: linkUrl || null,
            linkText: linkText || null
          }))
        })

        return NextResponse.json({
          success: true,
          data: {
            created: notifications.count,
            message: `Notification sent to ${notifications.count} users`
          }
        })
      } else {
        return NextResponse.json(
          { success: false, message: "Either isGlobal must be true or targetUsers must be provided" },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("ADMIN NOTIFICATIONS POST ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    )
  }
}
