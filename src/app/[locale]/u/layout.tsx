import { auth } from '@/auth';
import { getTranslations } from 'next-intl/server';
import UserLayoutClient from './UserLayoutClient';
import SignInForm from '@/components/modals/SignInForm';

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'UserLayout' });

  // If not authenticated, show sign-in form centered
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-full max-w-md lg:max-w-2xl p-8">
          <h1 className="text-2xl lg:text-4xl font-bold font-title mb-6 pb-2 lg:pb-4 text-center border-b border-gray-900">
            {t('signInPrompt')}
          </h1>
          <SignInForm />
        </div>
      </div>
    );
  }

  // If authenticated, show the user layout
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
