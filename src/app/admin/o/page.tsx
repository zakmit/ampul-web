import OrdersClient from './OrdersClient';
import { dummyOrders } from './_data/mockOrders';
import { auth } from '@/auth';
import {
  readOrders,
  readOrder,
  updateTrackingCode,
  updateOrderStatus,
  updateOrderAddress,
  acceptCancelRequest,
  acceptRefundRequest
} from './actions';
import type { OrderStatus } from './mockData';

export default async function OrdersPage() {
  // Check authentication
  const session = await auth();

  // Fetch orders if user is admin, otherwise use mock data
  let orders = dummyOrders;
  let serverActions = null;

  if (session && session.user.role === 'admin') {
    const result = await readOrders({
      timeRange: 'THIS MONTH',
      limit: 20,
    });

    if (result.success && result.data) {
      // Map OrderListItem to match the Order interface expected by OrdersClient
      orders = result.data.orders.map(order => ({
        ...order,
        status: order.status as OrderStatus,
      }));

      // Pass all server actions to the client component
      serverActions = {
        fetchOrders: readOrders,
        fetchOrder: readOrder,
        updateTrackingCode,
        updateOrderStatus,
        updateOrderAddress,
        acceptCancelRequest,
        acceptRefundRequest,
      };
    }
  }

  return <OrdersClient initialOrders={orders} serverActions={serverActions} />;
}
