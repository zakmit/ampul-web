import { Resend } from 'resend'
import { render } from '@react-email/components'
import OrderConfirmation, {
  type OrderConfirmationProps,
  type OrderEmailTranslations,
} from '@/emails/OrderConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? 'AMPUL <orders@ampul.com>'

// Fallback translations (English) used if message files can't be loaded
const fallbackTranslations: OrderEmailTranslations = {
  preview: 'Order {orderNumber} confirmed — thank you for your order.',
  greeting: 'Hello {name},',
  greetingGuest: 'Hello,',
  body: "Your order has been placed successfully. We'll notify you when it's on its way.",
  orderId: 'Order ID: {orderNumber}',
  freeSample: 'Free Sample',
  total: 'TOTAL',
  shipTo: 'SHIP TO',
  viewOrder: 'VIEW ORDER',
  footer: 'This is a demo store. No real transactions are processed.',
}

export async function sendOrderConfirmationEmail(
  to: string,
  props: Omit<OrderConfirmationProps, 't' | 'locale'>,
  locale: string = 'us'
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping order confirmation email')
    return
  }

  try {
    // Dynamically load the right message file
    const messageFile = locale === 'fr' ? 'fr-FR' : locale === 'tw' ? 'zh-TW' : 'en'
    let t: OrderEmailTranslations = fallbackTranslations
    try {
      const messages = await import(`../../messages/${messageFile}.json`)
      t = messages.OrderEmail as OrderEmailTranslations
    } catch {
      console.warn(`[email] Could not load translations for locale "${locale}", using English`)
    }

    const html = await render(OrderConfirmation({ ...props, t, locale }))
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `${t.orderId.replace('{orderNumber}', props.orderNumber)} — AMPUL`,
      html,
    })
  } catch (error) {
    console.error('[email] Failed to send order confirmation email:', error)
  }
}
