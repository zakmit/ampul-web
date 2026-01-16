'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { OrderStatus, Prisma } from '@/generated/prisma'
import { revalidatePath } from 'next/cache'
import { addressUpdateSchema, type AddressUpdateData } from './validation'
import { z } from 'zod'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// Interface for order detail
export interface OrderData {
  id: string
  orderNumber: string
  createdAt: Date
  customerName: string | null
  customerEmail: string
  status: OrderStatus
  total: number
  currency: string
  lastFour: string | null
  recipientName: string
  recipientPhone: string | null
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingRegion: string | null
  shippingPostal: string
  shippingCountry: string
  trackingCode: string | null
  items: Array<{
    id: string
    productName: string
    productImage: string | null
    productCategory: string
    productVolume: string | null
    quantity: number
    price: number
    isFreeSample: boolean
  }>
}

// Read recent orders for dashboard
export async function readRecentOrders(): Promise<ActionResult<Array<{
  id: string
  orderNumber: string
  createdAt: Date
  customerName: string
  status: string
  total: number
  currency: string
}>>> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        customerName: true,
        status: true,
        total: true,
        currency: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const orderList = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName || 'Unknown',
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
    }))

    return { success: true, data: orderList }
  } catch (error) {
    console.error('Error reading recent orders:', error)
    return { success: false, error: 'Failed to read recent orders' }
  }
}

// Read single order with all details
export async function readOrder(orderId: string): Promise<ActionResult<OrderData>> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            productImage: true,
            productCategory: true,
            productVolume: true,
            quantity: true,
            price: true,
            isFreeSample: true,
          },
        },
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const orderData: OrderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      lastFour: order.lastFour,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      shippingLine1: order.shippingLine1,
      shippingLine2: order.shippingLine2,
      shippingCity: order.shippingCity,
      shippingRegion: order.shippingRegion,
      shippingPostal: order.shippingPostal,
      shippingCountry: order.shippingCountry,
      trackingCode: order.trackingCode,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.productName,
        productImage: item.productImage,
        productCategory: item.productCategory,
        productVolume: item.productVolume,
        quantity: item.quantity,
        price: Number(item.price),
        isFreeSample: item.isFreeSample,
      })),
    }

    return { success: true, data: orderData }
  } catch (error) {
    console.error('Error reading order:', error)
    return { success: false, error: 'Failed to read order' }
  }
}

// Update tracking code
export async function updateTrackingCode(orderId: string, trackingCode: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const updateData: { trackingCode: string | null; status?: OrderStatus } = {
      trackingCode: trackingCode.trim() || null,
    }

    if (order.status === 'PENDING' && trackingCode.trim()) {
      updateData.status = 'SHIPPED'
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error updating tracking code:', error)
    return { success: false, error: 'Failed to update tracking code' }
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

// Update order address with validation
export async function updateOrderAddress(
  orderId: string,
  addressData: AddressUpdateData
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate address data
    const validatedData = addressUpdateSchema.parse(addressData)

    await prisma.order.update({
      where: { id: orderId },
      data: {
        recipientName: validatedData.recipientName,
        recipientPhone: validatedData.recipientPhone || null,
        shippingLine1: validatedData.shippingLine1,
        shippingLine2: validatedData.shippingLine2 || null,
        shippingCity: validatedData.shippingCity,
        shippingRegion: validatedData.shippingRegion || null,
        shippingPostal: validatedData.shippingPostal,
        shippingCountry: validatedData.shippingCountry,
      },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (field && typeof field === 'string') {
          fieldErrors[field] = issue.message
        }
      })
      return { success: false, error: 'Validation failed', data: { fieldErrors } }
    }
    console.error('Error updating order address:', error)
    return { success: false, error: 'Failed to update address' }
  }
}

// Accept cancel request
export async function acceptCancelRequest(orderId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status !== 'CANCELLING') {
      return { success: false, error: 'Order is not in CANCELLING status' }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error accepting cancel request:', error)
    return { success: false, error: 'Failed to accept cancel request' }
  }
}

// Accept refund request
export async function acceptRefundRequest(orderId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status !== 'REQUESTED') {
      return { success: false, error: 'Order is not in REQUESTED status' }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error accepting refund request:', error)
    return { success: false, error: 'Failed to accept refund request' }
  }
}

// Helper function to calculate date range based on time range string
function getDateRange(timeRange: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = new Date()
  let startDate = new Date()

  switch (timeRange) {
    case 'TODAY':
      startDate.setHours(0, 0, 0, 0)
      break
    case '7 DAYS':
      startDate.setDate(now.getDate() - 7)
      break
    case '1 MONTH':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'THIS MONTH':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case '3 MONTHS':
      startDate.setMonth(now.getMonth() - 3)
      break
    case 'THIS YEAR':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'A YEAR':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case 'ALL':
      startDate = new Date(0) // Beginning of time
      break
    default:
      startDate.setMonth(now.getMonth() - 1)
  }

  return { startDate, endDate }
}

// Dashboard statistics interface
export interface DashboardStats {
  userName: string
  revenue: {
    '$': number
    '€': number
    'NT$': number
    'ALL': number
  }
  orders: {
    '$': number
    '€': number
    'NT$': number
    'ALL': number
  }
  pendingOrders: {
    '$': number
    '€': number
    'NT$': number
    'ALL': number
  }
  userVisits: number
}

// Get dashboard statistics
export async function getDashboardStats(timeRange: string): Promise<ActionResult<DashboardStats>> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const { startDate, endDate } = getDateRange(timeRange)

    // Get user name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    })

    const userName = user?.name || 'Admin'

    // Get orders within time range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        currency: true,
        status: true,
      },
    })

    // Calculate revenue by currency
    const revenue = {
      '$': 0,
      '€': 0,
      'NT$': 0,
      'ALL': 0,
    }

    const orderCount = {
      '$': 0,
      '€': 0,
      'NT$': 0,
      'ALL': 0,
    }

    const pendingOrderCount = {
      '$': 0,
      '€': 0,
      'NT$': 0,
      'ALL': 0,
    }

    orders.forEach(order => {
      const amount = Number(order.total)
      const currency = order.currency as '$' | '€' | 'NT$'

      // Sum revenue per currency
      if (currency === '$' || currency === '€' || currency === 'NT$') {
        revenue[currency] += amount
      }

      orderCount[currency]++
      orderCount.ALL++

      if (order.status === 'PENDING') {
        pendingOrderCount[currency]++
        pendingOrderCount.ALL++
      }
    })

    // Calculate ALL revenue (sum of different currencies - for future use with currency exchange)
    revenue.ALL = revenue['$'] + revenue['€'] + revenue['NT$']

    // Get user visits based on lastLoginAt
    const userVisits = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const stats: DashboardStats = {
      userName,
      revenue,
      orders: orderCount,
      pendingOrders: pendingOrderCount,
      userVisits,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return { success: false, error: 'Failed to get dashboard statistics' }
  }
}

// Get revenue chart data
export async function getRevenueChartData(
  timeRange: string,
  currency: string
): Promise<ActionResult<Array<{ date: string; revenue: number }>>> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const { startDate, endDate } = getDateRange(timeRange)

    // Get orders within time range
    const whereClause: Prisma.OrderWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Filter by currency if not 'ALL'
    if (currency !== 'ALL') {
      whereClause.currency = currency
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        total: true,
        createdAt: true,
        currency: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group data by time period based on timeRange
    const dataPoints: { [key: string]: number } = {}

    orders.forEach(order => {
      const amount = Number(order.total)
      const date = new Date(order.createdAt)
      let key: string

      switch (timeRange) {
        case 'TODAY':
          // Group by hour
          key = `${date.getHours()}:00`
          break
        case '7 DAYS':
          // Group by day
          key = `${date.getMonth() + 1}/${date.getDate()}`
          break
        case '1 MONTH':
        case 'THIS MONTH':
          // Group by day
          const monthName = date.toLocaleString('en-US', { month: 'short' })
          key = `${monthName} ${date.getDate()}`
          break
        case '3 MONTHS':
          // Group by week
          const weekDate = new Date(date)
          weekDate.setDate(weekDate.getDate() - weekDate.getDay()) // Start of week
          const weekMonth = weekDate.toLocaleString('en-US', { month: 'short' })
          key = `${weekMonth} ${weekDate.getDate()}`
          break
        case 'THIS YEAR':
        case 'A YEAR':
          // Group by month
          key = date.toLocaleString('en-US', { month: 'short' })
          break
        case 'ALL':
          // Group by year
          key = date.getFullYear().toString()
          break
        default:
          key = date.toLocaleDateString()
      }

      dataPoints[key] = (dataPoints[key] || 0) + amount
    })

    // Convert to array format
    const chartData = Object.entries(dataPoints).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue),
    }))

    return { success: true, data: chartData }
  } catch (error) {
    console.error('Error getting revenue chart data:', error)
    return { success: false, error: 'Failed to get revenue chart data' }
  }
}

// Get orders chart data
export async function getOrdersChartData(
  timeRange: string,
  currency: string
): Promise<ActionResult<Array<{ date: string; orders: number }>>> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const { startDate, endDate } = getDateRange(timeRange)

    // Get orders within time range
    const whereClause: Prisma.OrderWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Filter by currency if not 'ALL'
    if (currency !== 'ALL') {
      whereClause.currency = currency
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group data by time period based on timeRange
    const dataPoints: { [key: string]: number } = {}

    orders.forEach(order => {
      const date = new Date(order.createdAt)
      let key: string

      switch (timeRange) {
        case 'TODAY':
          // Group by hour
          key = `${date.getHours()}:00`
          break
        case '7 DAYS':
          // Group by day
          key = `${date.getMonth() + 1}/${date.getDate()}`
          break
        case '1 MONTH':
        case 'THIS MONTH':
          // Group by day
          const monthName = date.toLocaleString('en-US', { month: 'short' })
          key = `${monthName} ${date.getDate()}`
          break
        case '3 MONTHS':
          // Group by week
          const weekDate = new Date(date)
          weekDate.setDate(weekDate.getDate() - weekDate.getDay()) // Start of week
          const weekMonth = weekDate.toLocaleString('en-US', { month: 'short' })
          key = `${weekMonth} ${weekDate.getDate()}`
          break
        case 'THIS YEAR':
        case 'A YEAR':
          // Group by month
          key = date.toLocaleString('en-US', { month: 'short' })
          break
        case 'ALL':
          // Group by year
          key = date.getFullYear().toString()
          break
        default:
          key = date.toLocaleDateString()
      }

      dataPoints[key] = (dataPoints[key] || 0) + 1
    })

    // Convert to array format
    const chartData = Object.entries(dataPoints).map(([date, orders]) => ({
      date,
      orders,
    }))

    return { success: true, data: chartData }
  } catch (error) {
    console.error('Error getting orders chart data:', error)
    return { success: false, error: 'Failed to get orders chart data' }
  }
}
