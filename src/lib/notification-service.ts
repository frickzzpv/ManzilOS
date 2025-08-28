import { db } from '@/lib/db'
import { NotificationType, NotificationChannel } from '@prisma/client'
import { getSocketIO } from '@/lib/socket'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  channel: NotificationChannel
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        channel: params.channel,
      },
    })

    if (params.channel === 'PUSH') {
      const io = getSocketIO()
      io.to(params.userId).emit('notification', notification)
    }

    console.log('Notification created:', notification)
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}
