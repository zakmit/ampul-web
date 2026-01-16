'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  locale: string
  basePath: string
}

export default function Pagination({ currentPage, totalPages, locale, basePath }: PaginationProps) {
  const t = useTranslations('OrdersPage')
  const router = useRouter()

  const goToPage = (page: number) => {
    const url = `/${locale}${basePath}?page=${page}`
    router.push(url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8 px-4">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
      >
        {t('pagination.previous')}
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-1 text-sm ${
              currentPage === page
                ? 'bg-gray-700 text-gray-100'
                : 'hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
      >
        {t('pagination.next')}
      </button>
    </div>
  )
}
