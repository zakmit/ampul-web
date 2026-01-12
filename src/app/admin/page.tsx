import { auth } from '@/auth';
import DashboardClient from './DashboardClient';
import { readRecentOrders, readOrder, updateTrackingCode, updateOrderStatus, updateOrderAddress, acceptCancelRequest, acceptRefundRequest } from './actions';
import { dummyOrders } from './o/_data/mockOrders';
import type { OrderTableItem, OrderStatus } from '@/components/ui/OrderTable';

export default async function AdminPage() {
  const session = await auth();

  // Default to mock data
  let orders: OrderTableItem[] = dummyOrders.slice(0, 10).map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: order.customerName,
    status: order.status as OrderStatus,
    total: order.total,
    currency: order.currency,
  }));

  let serverActions = null;

  // If authenticated as admin, fetch real orders and provide server actions
  if (session && session.user.role === 'admin') {
    const result = await readRecentOrders();

    if (result.success && result.data) {
      orders = result.data.map(order => ({
        ...order,
        status: order.status as OrderStatus,
      }));

      // Provide server actions for authenticated admin
      serverActions = {
        fetchOrder: readOrder,
        updateTrackingCode,
        updateOrderStatus,
        updateOrderAddress,
        acceptCancelRequest,
        acceptRefundRequest,
      };
    }
  }

  return <DashboardClient initialOrders={orders} serverActions={serverActions} />;
}