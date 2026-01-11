/**
 * Format date using browser's locale settings
 * Centralizes date formatting so we can easily change it across the app
 *
 * Advantages of using a formatter function:
 * 1. Consistency - All dates look the same across the app
 * 2. Easy to change - Update format in one place, applies everywhere
 * 3. Maintainability - Clear intent of what we're formatting
 * 4. Testing - Easier to mock for consistent snapshots
 *
 * @param date - Date to format
 * @returns Locale-formatted date string (e.g., "1/10/2026, 2:30 PM" in US locale)
 */
export function formatOrderDate(date: Date): string {
  return date.toLocaleString();
}
