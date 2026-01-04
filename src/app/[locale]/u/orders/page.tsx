import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OrderCard from '@/components/ui/OrderCard'
import Pagination from '@/components/ui/Pagination'

const ORDERS_PER_PAGE = 10

interface OrdersPageProps {
  params: {
    locale: string
  }
  searchParams: {
    page?: string
  }
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const { locale } = params
  const session = await auth()

  // Authentication is handled by the layout, so session will always exist here
  if (!session?.user?.email) {
    return null
  }

  const userEmail = session.user.email

  const currentPage = parseInt(searchParams.page || '1', 10)
  const skip = (currentPage - 1) * ORDERS_PER_PAGE

  // Get total count for pagination
  const totalOrders = await prisma.order.count({
    where: {
      customerEmail: userEmail,
    },
  })

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE)

  // Fetch orders for the current page
  const orders = await prisma.order.findMany({
    where: {
      customerEmail: userEmail,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: ORDERS_PER_PAGE,
  })

  // Transform orders to match OrderCard component's expected format
  const ordersForCards = orders.map((order) => ({
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
  }))

  return (
    <div className="pb-8 mx-4">
      {/* Orders List */}
      <div className="mt-4 gap-y-4 flex flex-col">
        {ordersForCards.length > 0 ? (
          ordersForCards.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            No orders found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          locale={locale}
          basePath="/u/orders"
        />
      )}
    </div>
  )
}
