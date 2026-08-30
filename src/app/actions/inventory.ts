'use server'

import { prisma } from '@/lib/prisma'
import { getInventoryAvailability, localeToDbLocale } from '@/lib/inventory'
import type { Locale } from '@/i18n/config'

export async function getProductInventory(productId: string, volumeId: number, locale: Locale) {
  const row = await prisma.productVolume.findUnique({
    where: {
      productId_volumeId_locale: {
        productId,
        volumeId,
        locale: localeToDbLocale[locale],
      },
    },
    select: { stock: true },
  })

  return getInventoryAvailability(row?.stock)
}
