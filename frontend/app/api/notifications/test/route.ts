import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Test Notification",
        message: "This is a test notification to verify the system is working.",
        type: "info",
        linkUrl: "/dashboard/projection",
        linkText: "View Projection"
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.read,
          linkUrl: notification.linkUrl,
          linkText: notification.linkText,
          createdAt: notification.createdAt
        }
      }
    })
  } catch (error) {
    console.error("TEST NOTIFICATION ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create test notification" },
      { status: 500 }
    )
  }
}
