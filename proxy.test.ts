import { expect, it, vi } from 'vitest'

const { createLocaleMiddleware, handleLocaleRouting, initializeAuth } = vi.hoisted(() => ({
  handleLocaleRouting: vi.fn(),
  createLocaleMiddleware: vi.fn(),
  initializeAuth: vi.fn(() => ({ auth: vi.fn() })),
}))

createLocaleMiddleware.mockReturnValue(handleLocaleRouting)

vi.mock('next-intl/middleware', () => ({
  default: createLocaleMiddleware,
}))

vi.mock('next-auth', () => ({
  default: initializeAuth,
}))

vi.mock('./src/i18n/routing', () => ({
  routing: { locales: ['us', 'fr', 'tw'], defaultLocale: 'us' },
}))

it('exports only the locale middleware without initializing Auth.js', async () => {
  const { default: proxy } = await import('./proxy')

  expect(createLocaleMiddleware).toHaveBeenCalledOnce()
  expect(proxy).toBe(handleLocaleRouting)
  expect(initializeAuth).not.toHaveBeenCalled()
})
