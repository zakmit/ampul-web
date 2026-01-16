import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import OrderCard from '@/components/ui/OrderCard'
import SignInForm from '@/components/ui/SignInForm'
import type { Metadata } from 'next'

interface SuccessPageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    orderId?: string
  }>
}

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('checkoutSuccess'),
  };
}

export default async function CheckoutSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = await params
  const searchParamsData = await searchParams
  const session = await auth()
  const t = await getTranslations({ locale, namespace: 'CheckoutSuccess' })

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-full max-w-md lg:max-w-2xl p-8">
          <h1 className="text-2xl lg:text-4xl font-bold font-title mb-6 pb-2 lg:pb-4 text-center border-b border-gray-900">
            {t('signInPrompt')}
          </h1>
          <SignInForm />
        </div>
      </div>
    )
  }

  if (!searchParamsData.orderId) {
    redirect(`/${locale}/checkout`)
  }

  const order = await prisma.order.findUnique({
    where: {
      id: searchParamsData.orderId,
    },
    include: {
      items: true,
    },
  })

  if (!order || order.customerEmail !== session.user.email) {
    redirect(`/${locale}/checkout`)
  }

  const orderForCard = {
    id: order.id,
    orderNumber: order.orderNumber,
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingCity: order.shippingCity,
    shippingRegion: order.shippingRegion,
    shippingPostal: order.shippingPostal,
    shippingCountry: order.shippingCountry,
    trackingCode: order.trackingCode,
    total: Number(order.total),
    currency: order.currency,
    status: order.status,
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productImage: item.productImage,
      productCategory: item.productCategory,
      productVolume: item.productVolume || '',
      quantity: item.quantity,
      price: Number(item.price),
      isFreeSample: item.isFreeSample,
    })),
    createdAt: order.createdAt.toISOString(),
  }

  return (
    <div className="min-h-screen px-6 py-8 lg:px-16 lg:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl lg:text-4xl font-bold font-title mb-2 text-center">
          {t('title')}
        </h1>
        <p className="text-base lg:text-lg text-center mb-8 italic">
          {t('orderNumber')}: {order.orderNumber}
        </p>

        <div className="mb-8">
          <OrderCard order={orderForCard} />
        </div>

        <div className="text-center">
          <a
            href={`/${locale}/u/orders`}
            className="inline-block px-8 py-3 bg-gray-700 text-white hover:bg-gray-900 transition-colors"
          >
            {t('viewOrders')}
          </a>
        </div>
      </div>
    </div>
  )
}
