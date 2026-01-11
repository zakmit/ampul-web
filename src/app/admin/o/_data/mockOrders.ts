// Mock order data for demonstration purposes
// This file contains 100 randomized orders with varied statuses, dates, totals, and currencies

type OrderStatus = 'PENDING' | 'SHIPPED' | 'REQUESTED' | 'CANCELLING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

interface MockOrder {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  status: OrderStatus;
  total: number;
  currency: string;
}

// Helper function to generate random ID (similar to cuid format)
function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'cm';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// Helper function to get a random date based on time range
function getRandomDate(): Date {
  const now = new Date();
  const ranges = [
    { max: 1 },           // TODAY
    { max: 7 },           // 7 DAYS
    { max: 30 },          // THIS MONTH
    { max: 90 },          // 3 MONTHS
    { max: 365 },         // THIS YEAR
  ];

  const range = ranges[Math.floor(Math.random() * ranges.length)];
  const daysAgo = Math.floor(Math.random() * range.max);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);

  return date;
}

// Helper function to generate random total (100x + 110y)
function getRandomOrderValues(): { total: number } {
  let x = Math.floor(Math.random() * 10); // 0-9 items at $100
  const y = Math.floor(Math.random() * 10); // 0-9 items at $110
  if (x + y < 1) x = 1;
  return {
    total: 100 * x + 110 * y,
  };
}

// Customer name pool
const customerNames = [
  'Cheyenne Culhane',
  'Paityn Schleifer',
  'James Calzoni',
  'Maria Passaquindici Arcand',
  'Ruben Franci',
  'Carter Geidt',
  'Terry Franci',
  'Craig Siphron',
  'Corey Press',
  'Paityn Philips',
  'Aspen Vaccaro',
  'Zaire Stanton',
  'Carla Septimus',
  'Kadin Aminoff',
  'Zain Vaccaro',
  'Alfredo Herwitz',
  'Talan Herwitz',
  'Zain Vetrovs',
  'Adison Geidt',
  'Terry Ekstrom Bothman',
  'Emerson Lipshutz',
  'Dakota Mango',
  'Phoenix Schleifer',
  'Morgan Calzoni',
  'Riley Vaccaro',
  'Jordan Aminoff',
  'Avery Herwitz',
  'Skyler Franci',
  'Cameron Press',
  'Quinn Septimus',
  'Blake Siphron',
  'Sage Vetrovs',
  'Rowan Geidt',
  'Harper Ekstrom',
  'Finley Lipshutz',
  'Reese Mango',
  'Drew Culhane',
  'Casey Philips',
  'Peyton Stanton',
  'Kendall Bothman',
  'Logan Martinez',
  'Taylor Anderson',
  'Skylar Thompson',
  'Addison Garcia',
  'Hayden Rodriguez',
  'Parker Wilson',
  'River Martinez',
  'Emery Lopez',
  'Lennon Gonzalez',
  'Oakley Hernandez',
];

const statuses: OrderStatus[] = ['PENDING', 'SHIPPED', 'REQUESTED', 'CANCELLING', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const currencies = ['$', '€'];

// Generate 100 mock orders
const generateMockOrders = (): MockOrder[] => {
  const orders: MockOrder[] = [];

  for (let i = 0; i < 100; i++) {
    const orderId = generateId();
    const { total } = getRandomOrderValues();
    orders.push({
      id: orderId,
      orderNumber: orderId,
      createdAt: getRandomDate(),
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      total,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
    });
  }

  // Sort by createdAt (newest first)
  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const dummyOrders = generateMockOrders();
