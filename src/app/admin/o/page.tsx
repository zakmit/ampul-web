import OrdersClient from './OrdersClient';
import { dummyOrders } from './_data/mockOrders';

export default async function OrdersPage() {
  // TODO: Add auth check here
  // const session = await auth();
  // if (!session || session.user.role !== 'ADMIN') {
  //   redirect('/');
  // }

  // TODO: Future - Fetch real data from database
  // const orders = await getOrders();

  // TODO: Future - Define and pass server actions
  // const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  //   'use server';
  //   // Implementation
  // };

  // For now, use mock data
  return <OrdersClient initialOrders={dummyOrders} />;
}
