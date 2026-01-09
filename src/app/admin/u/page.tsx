import UsersClient from './UsersClient';
import { dummyUsers } from './_data/mockUsers';

export default async function UsersPage() {
  // TODO: Add auth check here
  // const session = await auth();
  // if (!session || session.user.role !== 'ADMIN') {
  //   redirect('/');
  // }

  // TODO: Future - Fetch real data from database
  // const users = await getUsers();

  // TODO: Future - Define and pass server actions
  // const updateUser = async (userId: string, data: Partial<User>) => {
  //   'use server';
  //   // Implementation
  // };

  // For now, use mock data
  return <UsersClient initialUsers={dummyUsers} />;
}
