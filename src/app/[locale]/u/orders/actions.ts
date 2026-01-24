'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

type ActionResult = {
  success: boolean
  error?: string
}

export async function requestCancelOrder(orderId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, customerEmail: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Verify the order belongs to the current user
    if (order.customerEmail !== session.user.email) {
      return { success: false, error: 'Unauthorized' }
    }

    // Only allow cancellation of PENDING orders
    if (order.status !== 'PENDING') {
      return { success: false, error: 'Only pending orders can be cancelled' }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLING' },
    })

    return { success: true }
  } catch (error) {
    console.error('Error requesting order cancellation:', error)
    return { success: false, error: 'Failed to request cancellation' }
  }
}
