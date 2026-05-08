import { prisma, type Notification, type User } from '@/lib/prisma'

// Type definitions for notification data
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'admin'
type UserRole = 'USER' | 'ADMIN'
type AllRoles = UserRole | 'ALL'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: NotificationType
  linkUrl?: string
  linkText?: string
  isGlobal?: boolean
  targetRole?: UserRole | AllRoles | null
}

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createUserNotification(data: NotificationData) {
    try {
      const notification = await (prisma as any).notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          linkUrl: data.linkUrl,
          linkText: data.linkText
        }
      })

      console.log(`✅ Created user notification: ${data.title} for user: ${data.userId}`)
      return notification
    } catch (error) {
      console.error('❌ Failed to create user notification:', error)
      throw error
    }
  }

  /**
   * Create a global notification for all users or specific roles
   */
  static async createGlobalNotification(data: Omit<NotificationData, 'userId'>) {
    try {
      // Get target users based on role
      let targetUsers = []
      if (data.targetRole) {
        targetUsers = await (prisma as any).user.findMany({
          where: { role: data.targetRole }
        })
      } else {
        targetUsers = await (prisma as any).user.findMany()
      }

      // Create notifications for all target users
      const notifications = await (prisma as any).notification.createMany({
        data: targetUsers.map((user: any) => ({
          userId: user.id,
          title: data.title,
          message: data.message,
          type: data.type,
          linkUrl: data.linkUrl,
          linkText: data.linkText,
          isGlobal: true,
          targetRole: data.targetRole || null
        }))
      })

      console.log(`✅ Created global notification: ${data.title} for ${notifications.length} users`)
      return notifications
    } catch (error) {
      console.error('❌ Failed to create global notification:', error)
      throw error
    }
  }

  /**
   * Create notification when simulation is saved
   */
  static async onSimulationSaved(userId: string, simulationId: string, projectedSavings: number) {
    await this.createUserNotification({
      userId,
      title: 'Simulation Saved Successfully',
      message: `Your retirement projection has been saved with projected savings of MK ${projectedSavings.toLocaleString()}.`,
      type: 'success',
      linkUrl: `/dashboard/simulation/${simulationId}`,
      linkText: 'View Simulation'
    })
  }

  /**
   * Create notification when scenario is created
   */
  static async onScenarioCreated(userId: string, scenarioName: string, simulationId: string) {
    await this.createUserNotification({
      userId,
      title: 'Scenario Created Successfully',
      message: `Your scenario "${scenarioName}" has been created and linked to your simulation.`,
      type: 'success',
      linkUrl: `/dashboard/simulation/${simulationId}`,
      linkText: 'View Scenario'
    })
  }

  /**
   * Create notification for ML model training completion
   */
  static async onMLTrainingCompleted(status: 'completed' | 'failed' = 'completed', details?: string) {
    // Create for all admins
    await this.createGlobalNotification({
      title: `ML Model Training ${status === 'completed' ? 'Completed' : 'Failed'}`,
      message: details || `Machine learning model training has ${status}.`,
      type: status === 'completed' ? 'success' : 'error',
      targetRole: 'ADMIN'
    })
  }

  /**
   * Create notification for ML model deployment
   */
  static async onMLModelDeployed(version: string, accuracy?: number) {
    // Create for all admins
    await this.createGlobalNotification({
      title: 'ML Model Deployed',
      message: `New ML model version ${version} has been deployed${accuracy ? ` with ${accuracy}% accuracy` : ''}.`,
      type: 'info',
      targetRole: 'ADMIN'
    })
  }

  /**
   * Create notification for high-risk user scenarios
   */
  static async onHighRiskDetected(userId: string, riskFactors: string[]) {
    await this.createUserNotification({
      userId,
      title: 'High Risk Retirement Profile Detected',
      message: `Your retirement profile shows elevated risk factors: ${riskFactors.join(', ')}. Consider increasing contributions or adjusting retirement timeline.`,
      type: 'warning',
      linkUrl: '/dashboard/projection',
      linkText: 'Review Projection'
    })
  }

  /**
   * Create notification for milestone achievements
   */
  static async onMilestoneAchieved(userId: string, milestone: string, projectedSavings: number) {
    await this.createUserNotification({
      userId,
      title: 'Retirement Milestone Achieved',
      message: `Congratulations! ${milestone}. Your projected savings: MK ${projectedSavings.toLocaleString()}.`,
      type: 'success',
      linkUrl: '/dashboard/projection',
      linkText: 'View Progress'
    })
  }

  /**
   * Create notification for ML insights available
   */
  static async onMLInsightsReady(userId: string, insights: string) {
    await this.createUserNotification({
      userId,
      title: 'New ML Insights Available',
      message: `We've analyzed your retirement data and have personalized insights: ${insights}`,
      type: 'info',
      linkUrl: '/dashboard/projection',
      linkText: 'View Insights'
    })
  }

  /**
   * Create notification for system maintenance
   */
  static async onSystemMaintenance(title: string, message: string, affectedUsers?: 'USER' | 'ADMIN' | 'ALL') {
    await this.createGlobalNotification({
      title,
      message,
      type: 'warning',
      targetRole: affectedUsers || null
    })
  }

  /**
   * Create notification for contribution consistency issues
   */
  static async onContributionInconsistency(userId: string, consistencyScore: number) {
    let message = ''
    if (consistencyScore < 0.5) {
      message = 'Your contribution pattern shows significant irregularity. Consider setting up automatic contributions for better retirement planning.'
    } else if (consistencyScore < 0.8) {
      message = 'Your contributions could be more consistent. Small improvements in regularity could significantly impact your retirement readiness.'
    }

    if (message) {
      await this.createUserNotification({
        userId,
        title: 'Contribution Consistency Alert',
        message,
        type: 'info',
        linkUrl: '/dashboard/projection',
        linkText: 'Review Contributions'
      })
    }
  }
}
