import UsersClient from './UsersClient';
import { dummyUsers } from './_data/mockUsers';
import { auth } from '@/auth';
import {
  readUsers,
  readUser,
  readUserOrders,
  updateUser,
  updateUserAddress,
  readOrder,
  updateTrackingCode,
  updateOrderStatus,
  updateOrderAddress,
  acceptCancelRequest,
  acceptRefundRequest,
} from './actions';

export default async function UsersPage() {
  // Check authentication
  const session = await auth();

  // Fetch users if user is admin, otherwise use mock data
  let users = dummyUsers;
  let serverActions = null;

  if (session && session.user.role === 'admin') {
    const result = await readUsers({
      sortColumn: 'Last Log In',
      sortDirection: 'desc',
      limit: 20,
    });

    if (result.success && result.data) {
      // Map to match the User interface expected by UsersClient
      users = result.data.users.map(user => ({
        ...user,
        lastLogIn: user.lastLogIn,
        lastOrder: user.lastOrder,
      }));

      // Pass all server actions to the client component
      serverActions = {
        fetchUsers: readUsers,
        fetchUser: readUser,
        fetchUserOrders: readUserOrders,
        updateUser,
        updateUserAddress,
        fetchOrder: readOrder,
        updateTrackingCode,
        updateOrderStatus,
        updateOrderAddress,
        acceptCancelRequest,
        acceptRefundRequest,
      };
    }
  }

  return <UsersClient initialUsers={users} serverActions={serverActions} />;
}
