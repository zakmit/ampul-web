import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

export type OrderEmailTranslations = {
  preview: string
  greeting: string
  greetingGuest: string
  body: string
  orderId: string
  freeSample: string
  total: string
  shipTo: string
  viewOrder: string
  footer: string
}

export type OrderConfirmationProps = {
  orderNumber: string
  orderId: string
  customerName: string | null
  recipientName: string
  recipientPhone: string | null
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingRegion: string | null
  shippingPostal: string
  shippingCountry: string
  items: Array<{
    productName: string
    productImage: string | null
    productCategory: string
    productVolume: string | null
    quantity: number
    price: number
    isFreeSample: boolean
  }>
  total: number
  currency: string
  orderUrl: string
  locale: string
  t: OrderEmailTranslations
}

const previewProps: OrderConfirmationProps = {
  orderNumber: 'AMPUL-0001',
  orderId: 'clxxx000000000',
  customerName: 'Icarus',
  recipientName: 'Icarus',
  recipientPhone: '+1 555 0100',
  shippingLine1: '123 Wax Wing Lane',
  shippingLine2: 'Apt 4B',
  shippingCity: 'New York',
  shippingRegion: 'NY',
  shippingPostal: '10001',
  shippingCountry: 'United States',
  items: [
    {
      productName: 'Icare',
      productImage: null,
      productCategory: 'Greek Mythology',
      productVolume: '50ml',
      quantity: 1,
      price: 3800,
      isFreeSample: false,
    },
    {
      productName: 'Narcisse',
      productImage: null,
      productCategory: 'Greek Mythology',
      productVolume: '30ml',
      quantity: 2,
      price: 2800,
      isFreeSample: false,
    },
    {
      productName: 'Hélène',
      productImage: null,
      productCategory: 'Greek Mythology',
      productVolume: null,
      quantity: 1,
      price: 0,
      isFreeSample: true,
    },
  ],
  total: 9400,
  currency: '$',
  orderUrl: 'http://localhost:3000/us/checkout/success?orderId=clxxx000000000',
  locale: 'us',
  t: {
    preview: 'Order AMPUL-0001 confirmed — thank you for your order.',
    greeting: 'Hello {name},',
    greetingGuest: 'Hello,',
    body: "Your order has been placed successfully. We'll notify you when it's on its way.",
    orderId: 'Order ID: {orderNumber}',
    freeSample: 'Free Sample',
    total: 'TOTAL',
    shipTo: 'SHIP TO',
    viewOrder: 'VIEW ORDER',
    footer: 'This is a demo store. No real transactions are processed.',
  },
}

OrderConfirmation.defaultProps = previewProps

export default function OrderConfirmation({
  orderNumber,
  customerName,
  recipientName,
  recipientPhone,
  shippingLine1,
  shippingLine2,
  shippingCity,
  shippingRegion,
  shippingPostal,
  shippingCountry,
  items,
  total,
  currency,
  orderUrl,
  locale,
  t,
}: OrderConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const regularItems = items.filter((item) => !item.isFreeSample)
  const freeSample = items.find((item) => item.isFreeSample)
  const displayName = customerName || recipientName
  const greeting = t.greeting.replace('{name}', displayName)

  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Zilla+Slab:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');`}</style>
        {locale === 'tw' && (
          <style>{`
            @import url('https://fontsapi.zeoseven.com/256/main/result.css');
            @import url('https://font.emtech.cc/css/ZhuqueFangsong');
          `}</style>
        )}
      </Head>
      <Preview>{t.preview.replace('{orderNumber}', orderNumber)}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/AMPUL.png`}
              width={140}
              height={47}
              alt="AMPUL"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={{ ...text, fontSize: '14px', fontWeight: 'bold' }}>{greeting}</Text>
            <Text style={text}>{t.body}</Text>
          </Section>

          <Hr style={hr} />

          {/* Order Items */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              {t.orderId.replace('{orderNumber}', orderNumber)}
            </Heading>
            {regularItems.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={itemImageCol}>
                  {item.productImage ? (
                    <Img
                      src={item.productImage.startsWith('http') ? item.productImage : `${baseUrl}${item.productImage}`}
                      width={100}
                      height={100}
                      alt={item.productName}
                      style={itemImage}
                    />
                  ) : (
                    <div style={imagePlaceholder} />
                  )}
                </Column>
                <Column style={itemDetailsCol}>
                  <Text style={itemName}>{item.productName}</Text>
                  <Text style={itemMeta}>{item.productCategory}</Text>
                  {item.productVolume && (
                    <Text style={itemMeta}>{item.productVolume}</Text>
                  )}
                </Column>
                <Column style={itemQtyCol}>
                  <Text style={itemMeta}>x{item.quantity}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>
                    {item.price}
                    {currency}
                  </Text>
                </Column>
              </Row>
            ))}

            {freeSample && (
              <Row style={freeSampleRow}>
                <Column>
                  <Text style={freeSampleText}>{t.freeSample}</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={freeSampleText}>
                    {freeSample.productName}
                  </Text>
                </Column>
              </Row>
            )}

            <Row>
              <Column style={{ textAlign: 'right' }}>
                <Text style={totalValue}>{t.total}: {total}{currency}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Shipping Address */}
          <Section style={section}>
            <Row>
              <Column style={{ verticalAlign: 'top' }}>
                <Heading as="h2" style={sectionHeading}>{t.shipTo}</Heading>
              </Column>
              <Column style={{ verticalAlign: 'top', textAlign: 'right' }}>
                <Text style={addressText}>{recipientName}</Text>
                {recipientPhone && <Text style={addressText}>{recipientPhone}</Text>}
                <Text style={addressText}>{shippingLine1}</Text>
                {shippingLine2 && <Text style={addressText}>{shippingLine2}</Text>}
                <Text style={addressText}>
                  {shippingCity}
                  {shippingRegion ? `, ${shippingRegion}` : ''} {shippingPostal}
                </Text>
                <Text style={addressText}>{shippingCountry}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href={orderUrl} style={ctaButton}>
              {t.viewOrder}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>{t.footer}</Text>
            <Text style={footerText}>© AMPUL</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const body: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  fontFamily: '"Zilla Slab", "ZhuqueFangsong", Georgia, serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 32px',
  textAlign: 'center',
}


const section: React.CSSProperties = {
  padding: '16px 24px',
}

const sectionHeading: React.CSSProperties = {
  fontFamily: '"Averia Serif Libre", "Huiwen-mincho", Georgia, serif',
  fontStyle: 'italic',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#374151',
  marginBottom: '16px',
}

const text: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '4px 0',
}

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0',
}

const itemRow: React.CSSProperties = {
  marginBottom: '16px',
}

const itemImageCol: React.CSSProperties = {
  width: '100px',
  verticalAlign: 'top',
}

const itemImage: React.CSSProperties = {
  objectFit: 'cover',
}

const imagePlaceholder: React.CSSProperties = {
  width: '100px',
  height: '100px',
  backgroundColor: '#d1d5db',
}

const itemDetailsCol: React.CSSProperties = {
  verticalAlign: 'top',
  paddingLeft: '12px',
}

const itemQtyCol: React.CSSProperties = {
  verticalAlign: 'top',
  textAlign: 'center',
  width: '40px',
}

const itemPriceCol: React.CSSProperties = {
  verticalAlign: 'top',
  textAlign: 'right',
  width: '80px',
}

const itemName: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 2px 0',
}

const itemMeta: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '2px 0',
}

const itemPrice: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: 0,
}

const freeSampleRow: React.CSSProperties = {
  marginTop: '8px',
  marginBottom: '8px',
}

const freeSampleText: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  fontStyle: 'italic',
  margin: 0,
}


const totalValue: React.CSSProperties = {
  fontFamily: '"Averia Serif Libre", "Huiwen-mincho", Georgia, serif',
  fontSize: '14px',
  fontWeight: 'bold',
  fontStyle: 'italic',
  color: '#374151',
  margin: 0,
  paddingTop: '12px',
}

const addressText: React.CSSProperties = {
  fontSize: '13px',
  color: '#374151',
  margin: '2px 0',
  lineHeight: '1.5',
}

const ctaSection: React.CSSProperties = {
  padding: '24px 32px',
  textAlign: 'center',
}

const ctaButton: React.CSSProperties = {
  backgroundColor: '#374151',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'medium',
  padding: '12px 32px',
  textDecoration: 'none',
  display: 'inline-block',
}

const footer: React.CSSProperties = {
  padding: '16px 32px',
  backgroundColor: '#f9fafb',
  textAlign: 'center',
}

const footerText: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '2px 0',
}
