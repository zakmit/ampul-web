import { getProfile } from './actions'
import ProfileForm from './ProfileForm'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

interface ProfilePageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('profile'),
  };
}

export default async function ProfilePage() {
  // Auth check is now handled in layout
  // Fetch user profile data
  const result = await getProfile()

  if (result.error || !result.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    )
  }

  return <ProfileForm initialData={result} />
}
