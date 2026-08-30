import { cn } from "@/lib/utils"

/**
 * Shared form input appearance: background, border, focus ring, hover ring,
 * and placeholder. Sizing (text size, padding, width) is intentionally left to
 * each call site — pass overrides through `inputStyle` / `inputErrorStyle`.
 */
const INPUT_BASE =
  "w-full text-sm px-4 py-2 bg-white rounded-md transition-shadow focus:outline-none placeholder:italic"

export const INPUT_STYLE = cn(
  INPUT_BASE,
  "border border-gray-300 focus:ring-1 focus:ring-gray-900 hover:ring-1 hover:ring-gray-400"
)

export const INPUT_ERROR_STYLE = cn(
  INPUT_BASE,
  "border border-red-700 focus:ring-1 focus:ring-red-700 hover:ring-1 hover:ring-red-700/40"
)

/** `INPUT_STYLE` with call-site sizing/layout overrides merged in. */
export function inputStyle(...overrides: Parameters<typeof cn>) {
  return cn(INPUT_STYLE, ...overrides)
}

/** `INPUT_ERROR_STYLE` with call-site sizing/layout overrides merged in. */
export function inputErrorStyle(...overrides: Parameters<typeof cn>) {
  return cn(INPUT_ERROR_STYLE, ...overrides)
}
