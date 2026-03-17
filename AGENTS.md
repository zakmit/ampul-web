# AGENTS.md — Ampul Web

Quick reference for AI agents working in this repo. Read this before exploring the codebase.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.5.7 |
| Language | TypeScript | 5 |
| React | React + React DOM | 19.1.2 |
| i18n | next-intl | 4.4.0 |
| ORM | Prisma | 7.3.0 |
| Database | PostgreSQL (via `@prisma/adapter-pg`) | postgres:16 |
| Auth | NextAuth v5 (beta) + Google OAuth | 5.0.0-beta.30 |
| Styling | Tailwind CSS v4 | 4 |
| 3D | Three.js + @react-three/fiber + drei | 0.182.0 |
| Animation | Framer Motion | 12.23.26 |
| Testing | Vitest + Testing Library | 4.0.18 |

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # All user-facing pages (locale-prefixed routes)
│   │   ├── layout.tsx      # Root layout: wraps with NextIntlClientProvider
│   │   ├── page.tsx        # Home page
│   │   ├── c/[slug]/       # Collection pages
│   │   ├── p/[slug]/       # Product detail pages
│   │   ├── checkout/       # Checkout flow
│   │   ├── u/              # User account (profile, orders)
│   │   └── legal/          # Legal pages
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   └── search/              # Product/collection search
│   ├── admin/              # Admin dashboard (no locale prefix)
│   └── actions/            # Shared server actions (auth)
├── components/
│   ├── common/             # NavBar, Footer, LocaleSelector, Breadcrumb
│   ├── modals/             # SignIn, Search, ShoppingBag modals (client)
│   ├── product/            # ProductCard, Gallery, AddToBagButton
│   ├── home/               # HeroCarousel, 3D BottleViewer
│   ├── providers/          # ShoppingBag, Session, FramerMotion, LoadingOverlay
│   ├── admin/              # Admin-specific UI
│   └── shadcn/             # shadcn/ui component library
├── i18n/
│   ├── config.ts           # Locale definitions (us/fr/tw → en/fr-FR/zh-TW)
│   ├── routing.ts          # next-intl routing config (localePrefix: 'always')
│   └── request.ts          # Per-request locale resolution + message loading
├── lib/
│   ├── prisma.ts           # Prisma client singleton with PrismaPg adapter
│   ├── formatters.ts       # Data formatters
│   └── utils.ts            # Utility helpers
├── types/                  # Shared TypeScript types
├── generated/prisma/       # Generated Prisma client (do not edit)
└── auth.ts                 # NextAuth config
messages/
├── en.json                 # English (locale: us)
├── fr-FR.json              # French (locale: fr)
└── zh-TW.json              # Traditional Chinese (locale: tw)
prisma/
└── schema.prisma           # DB schema
```

---

## Locale System

### Locale codes vs message files

The URL locale code and the message filename are **different**:

| URL param (`locale`) | Message file | Display name |
|---------------------|-------------|-------------|
| `us` | `en.json` | English U.S. |
| `fr` | `fr-FR.json` | Français France |
| `tw` | `zh-TW.json` | 中文 Taiwan |

This mapping lives in [src/i18n/config.ts](src/i18n/config.ts) and [src/i18n/request.ts](src/i18n/request.ts).

### Routing

- All routes are prefixed with locale: `/us/...`, `/fr/...`, `/tw/...`
- `localePrefix: 'always'` — never omit the prefix
- Locale detection enabled from `Accept-Language` header
- Middleware at [middleware.ts](middleware.ts) chains NextAuth auth + i18n routing

---

## next-intl Usage Patterns

### Server Components — use `getTranslations()` (async)

```tsx
// In a Server Component or generateMetadata()
import { getTranslations } from 'next-intl/server';

export default async function Page({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  return <h1>{t('conceptTitle')}</h1>;
}

// generateMetadata also uses getTranslations
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return { title: t('home.title') };
}
```

Examples: [src/app/[locale]/page.tsx](src/app/%5Blocale%5D/page.tsx), [src/app/[locale]/p/[slug]/page.tsx](src/app/%5Blocale%5D/p/%5Bslug%5D/page.tsx)

### API Routes — also use `getTranslations()` (async)

```tsx
// In app/api/.../route.ts
import { getTranslations } from 'next-intl/server';

export async function GET(request: Request) {
  const locale = searchParams.get('locale') ?? 'us';
  const t = await getTranslations({ locale, namespace: 'SearchModal' });
  // ...
}
```

Example: [src/app/api/search/route.ts](src/app/api/search/route.ts)

### Client Components — use `useTranslations()` hook (sync)

```tsx
'use client';
import { useTranslations, useLocale } from 'next-intl';

export function NavBar() {
  const t = useTranslations('NavBar');
  const locale = useLocale(); // 'us' | 'fr' | 'tw'
  return <span>{t('banner')}</span>;
}
```

Examples: [src/components/common/NavBar.tsx](src/components/common/NavBar.tsx), [src/components/common/LocaleSelector.tsx](src/components/common/LocaleSelector.tsx)

### Client Provider — must wrap client tree in layout

```tsx
// src/app/[locale]/layout.tsx (Server Component)
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const messages = await getMessages({ locale });

return (
  <NextIntlClientProvider messages={messages} locale={locale}>
    {children}
  </NextIntlClientProvider>
);
```

### Navigation in Client Components

Use next-intl's locale-aware wrappers from [src/i18n/routing.ts](src/i18n/routing.ts), not Next.js directly:

```tsx
import { useRouter, usePathname, Link } from '@/i18n/routing';
// These automatically prepend the locale prefix
```

---

## Prisma / Database

- Client singleton: [src/lib/prisma.ts](src/lib/prisma.ts)
- Adapter: `@prisma/adapter-pg` (connection pool via `pg`)
- Schema: [prisma/schema.prisma](prisma/schema.prisma)

### Key Models

| Model | Purpose |
|-------|---------|
| `User` | Auth users; roles: `'user'` \| `'admin'` |
| `Product` | Products with slug, images, category/collection refs |
| `ProductTranslation` | Locale-specific name/concept/sensations per product |
| `Collection` / `CollectionTranslation` | Product groupings with translations |
| `Category` / `CategoryTranslation` | Product categories with translations |
| `Volume` / `VolumeTranslation` | Size variants with translations |
| `Tag` / `TagTranslation` | Product tags with translations |
| `Order` | Orders with status enum (PENDING→DELIVERED/CANCELLED etc.) |

Dynamic content (products, collections, categories) stores translations in separate `*Translation` tables keyed by locale strings `en-US`, `fr-FR`, `zh-TW` — **not** the URL locale codes.

---

## Server Actions

Server actions live in `actions.ts` files co-located with their feature:

| File | Actions |
|------|---------|
| [src/app/actions/auth.ts](src/app/actions/auth.ts) | `handleSignIn()`, `handleSignOut()` |
| [src/app/admin/actions.ts](src/app/admin/actions.ts) | `readRecentOrders()`, address updates |
| [src/app/admin/p/actions.ts](src/app/admin/p/actions.ts) | Product CRUD |
| [src/app/admin/u/actions.ts](src/app/admin/u/actions.ts) | User management |
| [src/app/[locale]/u/orders/actions.ts](src/app/%5Blocale%5D/u/orders/actions.ts) | Order operations |

---

## Translation Namespaces

Message keys are organized by namespace in the JSON files:

| Namespace | Used in |
|-----------|---------|
| `Common` | Shared strings, currency symbol |
| `NavBar` | Navigation bar |
| `HomePage` | Home page content |
| `ProductDetail` | Product detail page |
| `Breadcrumb` | Breadcrumb component |
| `UserLayout` | User account layout |
| `SearchModal` | Search modal + API route |
| `Metadata` | SEO metadata (title, description) |

---

## Static Generation

Product and collection pages use `generateStaticParams()` to pre-render all locale combinations:

```tsx
export async function generateStaticParams() {
  // Returns [{ locale: 'us', slug: '...' }, { locale: 'fr', slug: '...' }, ...]
}
```
