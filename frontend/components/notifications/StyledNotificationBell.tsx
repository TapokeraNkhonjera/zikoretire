"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  linkUrl?: string
  linkText?: string
  createdAt: string
  readAt?: string
  priority?: 'low' | 'medium' | 'high'
  metadata?: {
    category?: string
    confidence?: number
    actionable?: boolean
    activityType?: string
    adminId?: string
    adminName?: string
    details?: any
    pushNotification?: boolean
    senderId?: string
    senderName?: string
    senderRole?: string
    timestamp?: string
  }
}

interface StyledNotificationBellProps {
  className?: string
}

export default function StyledNotificationBell({ className }: StyledNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notifications?unreadOnly=false&limit=10")
      const data = await res.json()
      
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markRead",
          notificationId
        })
      })

      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" })
      })

      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          notificationId
        })
      })

      if (res.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (type: string, metadata?: any) => {
    switch (type) {
      case 'success':
        return '🟢'
      case 'warning':
        return '🟡'
      case 'error':
        return '🔴'
      case 'admin':
        return '📢'
      case 'ml_nudge':
        return '🤖'
      case 'admin_activity':
        return '⚙️'
      case 'push_notification':
        return '📱'
      case 'milestone_celebration':
        return '🎉'
      case 'system_update':
        return '🔄'
      case 'security_alert':
        return '🚨'
      case 'performance_issue':
        return '⚠️'
      case 'data_sync':
        return '📊'
      case 'backup_complete':
        return '💾'
      case 'user_suspension':
        return '🚫'
      case 'ml_model_update':
        return '🤖'
      default:
        return 'ℹ️'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon - Original Styling */}
      <button 
        className="relative p-2 border rounded-xl hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute w-2 h-2 rounded-full -top-1 -right-1 bg-primary" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 hover:bg-muted/50 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  } ${
                    notification.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
                  } ${
                    notification.priority === 'medium' ? 'border-l-4 border-l-yellow-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.linkUrl && (
                            <a
                              href={notification.linkUrl}
                              className="text-xs text-primary hover:underline mt-1 inline-block"
                              onClick={() => markAsRead(notification.id)}
                            >
                              {notification.linkText || 'View details'}
                            </a>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                          {notification.metadata?.confidence && (
                            <p className="text-xs text-blue-600 mt-1">
                              Confidence: {Math.round(notification.metadata.confidence * 100)}%
                            </p>
                          )}
                          {notification.metadata?.actionable && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Actionable
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
