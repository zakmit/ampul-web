'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma, OrderStatus } from '@/generated/prisma'
import { addressUpdateSchema, type AddressUpdateData } from './validation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export async function readProducts(): Promise<ActionResult<{ id: string; name: string }[]>> {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        translations: {
          where: {
            locale: 'en-US',
          },
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const productList = products.map(product => ({
      id: product.id,
      name: product.translations[0]?.name || 'Unnamed Product',
    }))

    return { success: true, data: productList }
  } catch (error) {
    console.error('Error reading products:', error)
    return { success: false, error: 'Failed to read products' }
  }
}

export interface OrderFilters {
  // Quick filter
  timeRange?: 'TODAY' | '7 DAYS' | '1 MONTH' | 'THIS MONTH' | '3 MONTHS' | 'THIS YEAR' | 'ALL'

  // Search
  searchColumn?: 'Order ID' | 'E-mail'
  searchQuery?: string

  // Status filter
  statuses?: string[]

  // Advanced filters
  dateFrom?: string
  dateTo?: string
  totalMin?: number
  totalMax?: number
  totalCurrency?: string

  // Address filters
  addressConditions?: Array<{
    type: 'line1' | 'line2' | 'city' | 'region' | 'postal' | 'country'
    value: string
  }>

  // Product filters
  productIds?: string[]

  // Sorting
  sortColumn?: 'Date' | 'Status'
  sortDirection?: 'asc' | 'desc'

  // Pagination
  page?: number
  limit?: number
}

export interface OrderListItem {
  id: string
  orderNumber: string
  createdAt: Date
  customerName: string
  customerEmail: string
  status: string
  total: number
  currency: string
}

export interface OrderListResult {
  orders: OrderListItem[]
  totalCount: number
}

export async function readOrders(filters?: OrderFilters): Promise<ActionResult<OrderListResult>> {
  try {
    // Check if user is admin
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const {
      timeRange = 'THIS MONTH',
      searchColumn,
      searchQuery,
      statuses = [],
      dateFrom,
      dateTo,
      totalMin,
      totalMax,
      totalCurrency,
      addressConditions = [],
      productIds = [],
      sortColumn = 'Date',
      sortDirection = 'desc',
      page = 1,
      limit = 20,
    } = filters || {}

    // Build where clause
    const where: Prisma.OrderWhereInput = {}

    // Time range filter
    if (timeRange !== 'ALL') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      let startDate: Date

      switch (timeRange) {
        case 'TODAY':
          startDate = today
          break
        case '7 DAYS':
          startDate = new Date(today)
          startDate.setDate(today.getDate() - 7)
          break
        case '1 MONTH':
          startDate = new Date(today)
          startDate.setMonth(today.getMonth() - 1)
          break
        case 'THIS MONTH':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case '3 MONTHS':
          startDate = new Date(today)
          startDate.setMonth(today.getMonth() - 3)
          break
        case 'THIS YEAR':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = today
      }

      where.createdAt = {
        gte: startDate,
      }
    }

    // Date range filter (overrides time range)
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      if (searchColumn === 'Order ID') {
        where.orderNumber = {
          contains: searchQuery.trim(),
          mode: 'insensitive',
        }
      } else if (searchColumn === 'E-mail') {
        where.customerEmail = {
          contains: searchQuery.trim(),
          mode: 'insensitive',
        }
      }
    }

    // Status filter
    if (statuses.length > 0) {
      where.status = {
        in: statuses as OrderStatus[],
      }
    }

    // Total filter
    if (totalMin !== undefined || totalMax !== undefined) {
      where.total = {}
      if (totalMin !== undefined) {
        where.total.gte = totalMin
      }
      if (totalMax !== undefined) {
        where.total.lte = totalMax
      }
    }

    // Currency filter
    if (totalCurrency) {
      where.currency = totalCurrency
    }

    // Address filters
    if (addressConditions.length > 0) {
      const addressWhere: Prisma.OrderWhereInput[] = addressConditions.map(condition => {
        const field = `shipping${condition.type.charAt(0).toUpperCase() + condition.type.slice(1)}` as keyof Prisma.OrderWhereInput
        return {
          [field === 'shippingLine1' ? 'shippingLine1' :
           field === 'shippingLine2' ? 'shippingLine2' :
           field === 'shippingCity' ? 'shippingCity' :
           field === 'shippingRegion' ? 'shippingRegion' :
           field === 'shippingPostal' ? 'shippingPostal' :
           'shippingCountry']: {
            contains: condition.value,
            mode: 'insensitive',
          }
        }
      })

      where.AND = addressWhere
    }

    // Product filters - need to filter orders that have ALL selected products (AND logic)
    // Exclude free samples from this filter
    if (productIds.length > 0) {
      // Create an array of conditions - order must have items with each productId
      const productConditions = productIds.map(productId => ({
        items: {
          some: {
            productId: productId,
            isFreeSample: false,
          }
        }
      }))

      // Merge with existing AND conditions or create new one
      if (where.AND && Array.isArray(where.AND)) {
        where.AND = [...where.AND, ...productConditions]
      } else if (where.AND) {
        where.AND = [where.AND, ...productConditions]
      } else {
        where.AND = productConditions
      }
    }

    // Get total count first
    const totalCount = await prisma.order.count({ where })

    // Fetch orders with item count
    let orders

    if (sortColumn === 'Status') {
      // Use raw SQL for custom status priority sorting
      const direction = sortDirection === 'asc' ? 'ASC' : 'DESC'
      orders = await prisma.$queryRaw<Array<{
        id: string
        orderNumber: string
        createdAt: Date
        customerName: string | null
        customerEmail: string
        status: string
        total: unknown
        currency: string
        itemCount: bigint
      }>>`
        SELECT
          o.id,
          o."orderNumber",
          o."createdAt",
          o."customerName",
          o."customerEmail",
          o.status,
          o.total,
          o.currency,
          COUNT(oi.id)::int as "itemCount"
        FROM "Order" o
        LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
        WHERE ${Prisma.raw(
          Object.keys(where).length > 0
            ? `o.id IN (SELECT id FROM "Order" WHERE ${Prisma.raw('TRUE')})`
            : 'TRUE'
        )}
        GROUP BY o.id
        ORDER BY
          CASE o.status
            WHEN 'PENDING' THEN 1
            WHEN 'REQUESTED' THEN 2
            WHEN 'CANCELLING' THEN 3
            WHEN 'SHIPPED' THEN 4
            WHEN 'DELIVERED' THEN 5
            WHEN 'CANCELLED' THEN 6
            WHEN 'REFUNDED' THEN 7
          END ${Prisma.raw(direction)}
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
      `
    } else {
      // Use standard Prisma query for date sorting
      orders = await prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          customerName: true,
          customerEmail: true,
          status: true,
          total: true,
          currency: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: sortDirection },
        take: limit,
        skip: (page - 1) * limit,
      })

      // Normalize the structure to match raw query output
      orders = orders.map(order => ({
        ...order,
        itemCount: BigInt(order._count.items),
      }))
    }

    // Transform to OrderListItem format
    const orderList: OrderListItem[] = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName || 'Unknown',
      customerEmail: order.customerEmail,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
    }))

    return {
      success: true,
      data: {
        orders: orderList,
        totalCount,
      }
    }
  } catch (error) {
    console.error('Error reading orders:', error)
    return { success: false, error: 'Failed to read orders' }
  }
}

// Interface for single order detail
export interface OrderDetail {
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

// Read single order with all details
export async function readOrder(orderId: string): Promise<ActionResult<OrderDetail>> {
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

    const orderDetail: OrderDetail = {
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

    return { success: true, data: orderDetail }
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

    // Get current order to check status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Update tracking code and change status to SHIPPED if currently PENDING
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

    revalidatePath('/admin/o')
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

    revalidatePath('/admin/o')
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

    revalidatePath('/admin/o')
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

// Accept cancel request - changes status from CANCELLING to CANCELLED
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

    revalidatePath('/admin/o')
    return { success: true }
  } catch (error) {
    console.error('Error accepting cancel request:', error)
    return { success: false, error: 'Failed to accept cancel request' }
  }
}

// Accept refund request - changes status from REQUESTED to REFUNDED
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

    revalidatePath('/admin/o')
    return { success: true }
  } catch (error) {
    console.error('Error accepting refund request:', error)
    return { success: false, error: 'Failed to accept refund request' }
  }
}
