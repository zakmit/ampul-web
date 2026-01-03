import { auth } from '@/auth';
import UserLayoutClient from './UserLayoutClient';
import SignInForm from '@/components/ui/SignInForm';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated, show sign-in form centered
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-full max-w-md p-8">
          <SignInForm />
        </div>
      </div>
    );
  }

  // If authenticated, show the user layout
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
