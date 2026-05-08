"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  user?: {
    name: string
    email: string
  }
}

interface AdminNotificationBellProps {
  className?: string
}

export default function AdminNotificationBell({ className }: AdminNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  
  // Form state for creating notifications
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetRole: '',
    isGlobal: true,
    linkUrl: '',
    linkText: ''
  })

  // Fetch admin notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/notifications")
      const data = await res.json()
      
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.notifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Failed to fetch admin notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Create notification
  const createNotification = async () => {
    if (!formData.title || !formData.message) {
      alert('Title and message are required')
      return
    }

    try {
      setCreateLoading(true)
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'create',
          ...formData
        })
      })

      const data = await res.json()
      
      if (data.success) {
        alert(`Notification sent to ${data.data.created} users`)
        setFormData({
          title: '',
          message: '',
          type: 'info',
          targetRole: '',
          isGlobal: true,
          linkUrl: '',
          linkText: ''
        })
        setShowCreateForm(false)
        fetchNotifications()
      } else {
        alert('Failed to create notification: ' + data.message)
      }
    } catch (error) {
      console.error("Failed to create notification:", error)
      alert('Failed to create notification')
    } finally {
      setCreateLoading(false)
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '🟢'
      case 'warning':
        return '🟡'
      case 'error':
        return '🔴'
      case 'admin':
        return '📢'
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
        <div className="absolute right-0 mt-2 w-96 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Admin Notifications</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="text-xs"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Create
                </Button>
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

          {/* Create Notification Form */}
          {showCreateForm && (
            <div className="p-4 border-b bg-muted/30">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="text-xs">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-xs">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    className="h-16 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="type" className="text-xs">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetRole" className="text-xs">Target</Label>
                    <Select value={formData.targetRole} onValueChange={(value) => setFormData(prev => ({ ...prev, targetRole: value }))}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Users</SelectItem>
                        <SelectItem value="USER">Users Only</SelectItem>
                        <SelectItem value="ADMIN">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={createNotification}
                    disabled={createLoading}
                    className="flex-1 h-8"
                  >
                    {createLoading ? 'Sending...' : 'Send Notification'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                          {notification.user && (
                            <p className="text-xs text-blue-600 mt-1">
                              To: {notification.user.name} ({notification.user.email})
                            </p>
                          )}
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
