'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { profileSchema, type ProfileFormData } from './validation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function getProfile() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { address: true },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    return {
      user: {
        name: user.name,
        email: user.email,
        birthday: user.birthday?.toISOString().split('T')[0] || null,
        phone: user.phone,
      },
      address: user.address ? {
        addressLine1: user.address.addressLine1,
        addressLine2: user.address.addressLine2,
        city: user.address.city,
        region: user.address.region,
        postalCode: user.address.postalCode,
        country: user.address.country,
      } : null,
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { error: 'Failed to load profile' }
  }
}

export async function updateProfile(data: ProfileFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Validate input
    const validatedData = profileSchema.parse(data)

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        phone: validatedData.phone,
      },
    })

    // Upsert address
    await prisma.address.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        addressLine1: validatedData.addressLine1,
        addressLine2: validatedData.addressLine2 || null,
        city: validatedData.city,
        region: validatedData.region || null,
        postalCode: validatedData.postalCode,
        country: validatedData.country,
      },
      update: {
        addressLine1: validatedData.addressLine1,
        addressLine2: validatedData.addressLine2 || null,
        city: validatedData.city,
        region: validatedData.region || null,
        postalCode: validatedData.postalCode,
        country: validatedData.country,
      },
    })

    revalidatePath('/[locale]/u/profile', 'page')

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
      return { fieldErrors }
    }
    console.error('Error updating profile:', error)
    return { error: 'Failed to update profile' }
  }
}
