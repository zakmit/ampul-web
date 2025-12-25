'use client';

import { useState } from 'react';
import OrderCard from '@/components/ui/OrderCard';

// Dummy product images - using actual product images
const PRODUCT_IMAGES = [
  '/uploads/products/product-desktop-1765956476426-18108652.jpg',
  '/uploads/products/product-desktop-1765956652459-892029664.jpg',
  '/uploads/products/product-desktop-1766110964525-95416179.jpg',
  '/uploads/products/product-desktop-1766111492032-989424800.jpg',
  '/uploads/products/product-desktop-1765956476426-18108652.jpg', // Reuse first image for 5th product
];

type OrderItem = {
  id: string;
  productName: string;
  productImage: string | null;
  productCategory: string;
  productVolume: string;
  quantity: number;
  price: number;
};

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

type Order = {
  id: string;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string | null;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingRegion: string | null;
  shippingPostal: string;
  shippingCountry: string;
  trackingCode: string | null;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
};

// Generate dummy orders
const generateDummyOrders = (): Order[] => {
  const items: OrderItem[] = [
    {
      id: 'i1',
      productName: 'Icarus',
      productImage: PRODUCT_IMAGES[0],
      productCategory: 'Eau de Toilette',
      productVolume: '100ml',
      quantity: 1,
      price: 100,
    },
    {
      id: 'i2',
      productName: 'Antigone',
      productImage: PRODUCT_IMAGES[1],
      productCategory: 'Eau de Toilette',
      productVolume: '100ml',
      quantity: 1,
      price: 100,
    },
    {
      id: 'i3',
      productName: 'Narcisse',
      productImage: PRODUCT_IMAGES[2],
      productCategory: 'Eau de Toilette',
      productVolume: '100ml',
      quantity: 1,
      price: 100,
    },
    {
      id: 'i4',
      productName: 'Prometheus',
      productImage: PRODUCT_IMAGES[3],
      productCategory: 'Eau de Parfum',
      productVolume: '50ml',
      quantity: 2,
      price: 120,
    },
    {
      id: 'i5',
      productName: 'Orpheus',
      productImage: PRODUCT_IMAGES[4],
      productCategory: 'Eau de Toilette',
      productVolume: '100ml',
      quantity: 1,
      price: 100,
    },
  ];

  const orders: Order[] = [
    {
      id: 'o1',
      orderNumber: 'ORD-2025-001',
      recipientName: 'Apollodorus',
      recipientPhone: '+33 1 23 45 67 89',
      shippingLine1: 'No.11, Soleil St.',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75005',
      shippingCountry: 'France',
      trackingCode: 'FR1234567890',
      total: 300,
      status: 'DELIVERED',
      items: [items[0], items[1], items[2]],
      createdAt: '2025-12-21T10:00:00Z',
    },
    {
      id: 'o2',
      orderNumber: 'ORD-2025-002',
      recipientName: 'Apollodorus',
      recipientPhone: '+33 1 23 45 67 89',
      shippingLine1: 'No.11, Soleil St.',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75005',
      shippingCountry: 'France',
      trackingCode: null,
      total: 300,
      status: 'PROCESSING',
      items: [items[0], items[1], items[2]],
      createdAt: '2025-12-21T14:30:00Z',
    },
    {
      id: 'o3',
      orderNumber: 'ORD-2025-003',
      recipientName: 'Artemis Chen',
      recipientPhone: '+33 6 98 76 54 32',
      shippingLine1: 'No.88, Avenue des Champs',
      shippingLine2: 'Apt 4B',
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75008',
      shippingCountry: 'France',
      trackingCode: 'FR0987654321',
      total: 440,
      status: 'SHIPPED',
      items: [items[0], items[1], items[3], items[4]],
      createdAt: '2025-12-15T09:15:00Z',
    },
    {
      id: 'o4',
      orderNumber: 'ORD-2025-004',
      recipientName: 'Dionysus Martin',
      recipientPhone: '+33 1 45 67 89 01',
      shippingLine1: 'No.42, Rue de Rivoli',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75004',
      shippingCountry: 'France',
      trackingCode: 'FR1122334455',
      total: 200,
      status: 'DELIVERED',
      items: [items[1], items[4]],
      createdAt: '2025-12-10T16:20:00Z',
    },
    {
      id: 'o5',
      orderNumber: 'ORD-2025-005',
      recipientName: 'Persephone Laurent',
      recipientPhone: null,
      shippingLine1: 'No.15, Boulevard Saint-Germain',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75006',
      shippingCountry: 'France',
      trackingCode: null,
      total: 340,
      status: 'PROCESSING',
      items: [items[2], items[3], items[4]],
      createdAt: '2025-12-05T11:45:00Z',
    },
    {
      id: 'o6',
      orderNumber: 'ORD-2025-006',
      recipientName: 'Zeus Dubois',
      recipientPhone: '+33 6 12 34 56 78',
      shippingLine1: 'No.7, Place de la Concorde',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75001',
      shippingCountry: 'France',
      trackingCode: 'FR5566778899',
      total: 500,
      status: 'DELIVERED',
      items: [items[0], items[1], items[2], items[3], items[4]],
      createdAt: '2025-11-28T13:00:00Z',
    },
    {
      id: 'o7',
      orderNumber: 'ORD-2025-007',
      recipientName: 'Athena Moreau',
      recipientPhone: '+33 1 98 76 54 32',
      shippingLine1: 'No.23, Rue du Faubourg',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75003',
      shippingCountry: 'France',
      trackingCode: 'FR9988776655',
      total: 300,
      status: 'DELIVERED',
      items: [items[0], items[1], items[2]],
      createdAt: '2025-11-20T08:30:00Z',
    },
    {
      id: 'o8',
      orderNumber: 'ORD-2025-008',
      recipientName: 'Hermes Bernard',
      recipientPhone: '+33 6 55 44 33 22',
      shippingLine1: 'No.56, Avenue Montaigne',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75007',
      shippingCountry: 'France',
      trackingCode: 'FR4455667788',
      total: 220,
      status: 'DELIVERED',
      items: [items[1], items[3]],
      createdAt: '2025-11-15T15:10:00Z',
    },
    {
      id: 'o9',
      orderNumber: 'ORD-2025-009',
      recipientName: 'Hera Petit',
      recipientPhone: '+33 1 22 33 44 55',
      shippingLine1: 'No.34, Rue de la Paix',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75002',
      shippingCountry: 'France',
      trackingCode: null,
      total: 200,
      status: 'CANCELLED',
      items: [items[0], items[4]],
      createdAt: '2025-11-08T12:00:00Z',
    },
    {
      id: 'o10',
      orderNumber: 'ORD-2025-010',
      recipientName: 'Apollo Garcia',
      recipientPhone: '+33 6 77 88 99 00',
      shippingLine1: 'No.91, Boulevard Haussmann',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75009',
      shippingCountry: 'France',
      trackingCode: 'FR3344556677',
      total: 400,
      status: 'DELIVERED',
      items: [items[0], items[1], items[2], items[4]],
      createdAt: '2025-11-01T10:45:00Z',
    },
    {
      id: 'o11',
      orderNumber: 'ORD-2025-011',
      recipientName: 'Poseidon Rousseau',
      recipientPhone: '+33 1 66 77 88 99',
      shippingLine1: 'No.12, Avenue Victor Hugo',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75016',
      shippingCountry: 'France',
      trackingCode: 'FR2233445566',
      total: 300,
      status: 'DELIVERED',
      items: [items[0], items[1], items[2]],
      createdAt: '2025-10-25T14:20:00Z',
    },
    {
      id: 'o12',
      orderNumber: 'ORD-2025-012',
      recipientName: 'Demeter Simon',
      recipientPhone: '+33 6 11 22 33 44',
      shippingLine1: 'No.45, Rue Lafayette',
      shippingLine2: null,
      shippingCity: 'Paris',
      shippingRegion: 'Île-de-France',
      shippingPostal: '75010',
      shippingCountry: 'France',
      trackingCode: 'FR6677889900',
      total: 240,
      status: 'DELIVERED',
      items: [items[3], items[4]],
      createdAt: '2025-10-18T09:00:00Z',
    },
  ];

  return orders;
};

const ORDERS_PER_PAGE = 10;

export default function OrdersPage() {
  const allOrders = generateDummyOrders();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentOrders = allOrders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the orders list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-8 mx-4">
      {/* Orders List */}
      <div className="mt-4 gap-y-4 flex flex-col">
        {currentOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 px-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm ${
                  currentPage === page
                    ? 'bg-gray-700 text-white'
                    : 'hover:bg-gray-100'
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
            Next
          </button>
        </div>
      )}
    </div>
  );
}
