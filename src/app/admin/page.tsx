import { auth } from '@/auth';
import DashboardClient from './DashboardClient';
import {
  readRecentOrders,
  readOrder,
  updateTrackingCode,
  updateOrderStatus,
  updateOrderAddress,
  acceptCancelRequest,
  acceptRefundRequest,
  getDashboardStats,
  getRevenueChartData,
  getOrdersChartData,
} from './actions';
import { dummyOrders } from './o/_data/mockOrders';
import type { OrderTableItem, OrderStatus } from '@/components/admin/OrderTable';

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
  let dashboardStats = null;
  let revenueChartData = null;
  let ordersChartData = null;

  // If authenticated as admin, fetch real data and provide server actions
  if (session && session.user.role === 'admin') {
    const ordersResult = await readRecentOrders();

    if (ordersResult.success && ordersResult.data) {
      orders = ordersResult.data.map(order => ({
        ...order,
        status: order.status as OrderStatus,
      }));

      // Fetch initial dashboard data with default filters
      const defaultTimeRange = 'THIS MONTH';
      const defaultRevenueCurrency = '$';
      const defaultOrdersCurrency = 'ALL';

      const [statsResult, revenueResult, ordersChartResult] = await Promise.all([
        getDashboardStats(defaultTimeRange),
        getRevenueChartData(defaultTimeRange, defaultRevenueCurrency),
        getOrdersChartData(defaultTimeRange, defaultOrdersCurrency),
      ]);

      if (statsResult.success && statsResult.data) {
        dashboardStats = statsResult.data;
      }

      if (revenueResult.success && revenueResult.data) {
        revenueChartData = revenueResult.data;
      }

      if (ordersChartResult.success && ordersChartResult.data) {
        ordersChartData = ordersChartResult.data;
      }

      // Provide server actions for authenticated admin
      serverActions = {
        fetchOrder: readOrder,
        updateTrackingCode,
        updateOrderStatus,
        updateOrderAddress,
        acceptCancelRequest,
        acceptRefundRequest,
        getDashboardStats,
        getRevenueChartData,
        getOrdersChartData,
      };
    }
  }

  return (
    <DashboardClient
      initialOrders={orders}
      serverActions={serverActions}
      initialDashboardStats={dashboardStats}
      initialRevenueChartData={revenueChartData}
      initialOrdersChartData={ordersChartData}
    />
  );
}