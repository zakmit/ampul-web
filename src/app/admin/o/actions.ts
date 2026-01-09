'use server'

import { prisma } from '@/lib/prisma'

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
