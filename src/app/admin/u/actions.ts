'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma, OrderStatus } from '@/generated/prisma'
import { userUpdateSchema, userAddressUpdateSchema, type UserUpdateData, type UserAddressUpdateData } from './validation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export interface UserFilters {
  // Search
  searchColumn?: 'E-mail' | 'Name' | 'Order ID'
  searchQuery?: string

  // Date filters
  lastLogInFrom?: string
  lastLogInTo?: string
  lastOrderFrom?: string
  lastOrderTo?: string

  // Address filters
  addressConditions?: Array<{
    type: 'line1' | 'line2' | 'city' | 'region' | 'postal' | 'country'
    value: string
  }>

  // Sorting
  sortColumn?: 'Last Log In' | 'Last Order'
  sortDirection?: 'asc' | 'desc'

  // Pagination
  page?: number
  limit?: number
}

export interface UserListItem {
  id: string
  email: string
  name: string
  lastLogIn: Date | null
  lastOrder: Date | null
}

export interface UserListResult {
  users: UserListItem[]
  totalCount: number
}

export async function readUsers(filters?: UserFilters): Promise<ActionResult<UserListResult>> {
  try {
    // Check if user is admin
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const {
      searchColumn,
      searchQuery,
      lastLogInFrom,
      lastLogInTo,
      lastOrderFrom,
      lastOrderTo,
      addressConditions = [],
      sortColumn = 'Last Log In',
      sortDirection = 'desc',
      page = 1,
      limit = 20,
    } = filters || {}

    // Build where clause
    const where: Prisma.UserWhereInput = {}

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      if (searchColumn === 'E-mail') {
        where.email = {
          contains: searchQuery.trim(),
          mode: 'insensitive',
        }
      } else if (searchColumn === 'Name') {
        where.name = {
          contains: searchQuery.trim(),
          mode: 'insensitive',
        }
      } else if (searchColumn === 'Order ID') {
        // Search by order number - find users who have orders with matching order number
        where.orders = {
          some: {
            orderNumber: {
              contains: searchQuery.trim(),
              mode: 'insensitive',
            }
          }
        }
      }
    }

    // Last Log In filter
    if (lastLogInFrom || lastLogInTo) {
      where.lastLoginAt = {}
      if (lastLogInFrom) {
        where.lastLoginAt.gte = new Date(lastLogInFrom)
      }
      if (lastLogInTo) {
        const endDate = new Date(lastLogInTo)
        endDate.setHours(23, 59, 59, 999)
        where.lastLoginAt.lte = endDate
      }
    }

    // Last Order filter
    if (lastOrderFrom || lastOrderTo) {
      where.lastOrderAt = {}
      if (lastOrderFrom) {
        where.lastOrderAt.gte = new Date(lastOrderFrom)
      }
      if (lastOrderTo) {
        const endDate = new Date(lastOrderTo)
        endDate.setHours(23, 59, 59, 999)
        where.lastOrderAt.lte = endDate
      }
    }

    // Address filters
    if (addressConditions.length > 0) {
      const addressWhere: Prisma.UserWhereInput[] = addressConditions.map(condition => {
        const field = `address${condition.type.charAt(0).toUpperCase() + condition.type.slice(1)}` as string

        return {
          address: {
            [field === 'addressLine1' ? 'addressLine1' :
             field === 'addressLine2' ? 'addressLine2' :
             field === 'addressCity' ? 'city' :
             field === 'addressRegion' ? 'region' :
             field === 'addressPostal' ? 'postalCode' :
             'country']: {
              contains: condition.value,
              mode: 'insensitive',
            }
          }
        }
      })

      where.AND = addressWhere
    }

    // Get total count first
    const totalCount = await prisma.user.count({ where })

    // Build orderBy clause
    const orderBy: Prisma.UserOrderByWithRelationInput = sortColumn === 'Last Log In'
      ? { lastLoginAt: sortDirection }
      : { lastOrderAt: sortDirection }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        lastLoginAt: true,
        lastOrderAt: true,
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    })

    // Transform to UserListItem format
    const userList: UserListItem[] = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || 'Unknown',
      lastLogIn: user.lastLoginAt,
      lastOrder: user.lastOrderAt,
    }))

    return {
      success: true,
      data: {
        users: userList,
        totalCount,
      }
    }
  } catch (error) {
    console.error('Error reading users:', error)
    return { success: false, error: 'Failed to read users' }
  }
}

// Interface for single user detail
export interface UserDetail {
  id: string
  email: string
  name: string | null
  birthday: Date | null
  phone: string | null
  lastLoginAt: Date | null
  lastOrderAt: Date | null
  orderCount: number
  address: {
    recipientName: string | null
    recipientPhone: string | null
    addressLine1: string
    addressLine2: string | null
    city: string
    region: string | null
    postalCode: string
    country: string
  } | null
}

// Read single user with all details
export async function readUser(userId: string): Promise<ActionResult<UserDetail>> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const userDetail: UserDetail = {
      id: user.id,
      email: user.email,
      name: user.name,
      birthday: user.birthday,
      phone: user.phone,
      lastLoginAt: user.lastLoginAt,
      lastOrderAt: user.lastOrderAt,
      orderCount: user._count.orders,
      address: user.address ? {
        recipientName: user.address.recipientName,
        recipientPhone: user.address.recipientPhone,
        addressLine1: user.address.addressLine1,
        addressLine2: user.address.addressLine2,
        city: user.address.city,
        region: user.address.region,
        postalCode: user.address.postalCode,
        country: user.address.country,
      } : null,
    }

    return { success: true, data: userDetail }
  } catch (error) {
    console.error('Error reading user:', error)
    return { success: false, error: 'Failed to read user' }
  }
}

// Get user's orders
export interface UserOrderListItem {
  id: string
  orderNumber: string
  createdAt: Date
  customerName: string
  status: OrderStatus
  total: number
  currency: string
}

export interface UserOrdersResult {
  orders: UserOrderListItem[]
  totalCount: number
}

export async function readUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<ActionResult<UserOrdersResult>> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const where: Prisma.OrderWhereInput = { userId }

    const totalCount = await prisma.order.count({ where })

    const orders = await prisma.order.findMany({
      where,
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
      take: limit,
      skip: (page - 1) * limit,
    })

    const orderList: UserOrderListItem[] = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName || 'Unknown',
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
    console.error('Error reading user orders:', error)
    return { success: false, error: 'Failed to read user orders' }
  }
}

// Update user information
export async function updateUser(
  userId: string,
  userData: UserUpdateData
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate user data
    const validatedData = userUpdateSchema.parse(userData)

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        phone: validatedData.phone || null,
      },
    })

    revalidatePath('/admin/u')
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
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

// Update user address
export async function updateUserAddress(
  userId: string,
  addressData: UserAddressUpdateData
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate address data
    const validatedData = userAddressUpdateSchema.parse(addressData)

    // Check if user has an address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { address: true },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    if (user.address) {
      // Update existing address
      await prisma.address.update({
        where: { userId },
        data: {
          recipientName: validatedData.recipientName || null,
          recipientPhone: validatedData.recipientPhone || null,
          addressLine1: validatedData.addressLine1,
          addressLine2: validatedData.addressLine2 || null,
          city: validatedData.city,
          region: validatedData.region || null,
          postalCode: validatedData.postalCode,
          country: validatedData.country,
        },
      })
    } else {
      // Create new address
      await prisma.address.create({
        data: {
          userId,
          recipientName: validatedData.recipientName || null,
          recipientPhone: validatedData.recipientPhone || null,
          addressLine1: validatedData.addressLine1,
          addressLine2: validatedData.addressLine2 || null,
          city: validatedData.city,
          region: validatedData.region || null,
          postalCode: validatedData.postalCode,
          country: validatedData.country,
        },
      })
    }

    revalidatePath('/admin/u')
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
    console.error('Error updating user address:', error)
    return { success: false, error: 'Failed to update address' }
  }
}

// Re-export order actions for editing orders from user management
// Note: In "use server" files, we need to create wrapper functions instead of re-exporting
import {
  readOrder as _readOrder,
  updateTrackingCode as _updateTrackingCode,
  updateOrderStatus as _updateOrderStatus,
  updateOrderAddress as _updateOrderAddress,
  acceptCancelRequest as _acceptCancelRequest,
  acceptRefundRequest as _acceptRefundRequest,
} from '@/app/admin/o/actions'
import type { AddressUpdateData } from '@/app/admin/o/validation'

export type { OrderDetail } from '@/app/admin/o/actions'

export async function readOrder(orderId: string) {
  return _readOrder(orderId)
}

export async function updateTrackingCode(orderId: string, trackingCode: string) {
  return _updateTrackingCode(orderId, trackingCode)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return _updateOrderStatus(orderId, status)
}

export async function updateOrderAddress(orderId: string, addressData: AddressUpdateData) {
  return _updateOrderAddress(orderId, addressData)
}

export async function acceptCancelRequest(orderId: string) {
  return _acceptCancelRequest(orderId)
}

export async function acceptRefundRequest(orderId: string) {
  return _acceptRefundRequest(orderId)
}
