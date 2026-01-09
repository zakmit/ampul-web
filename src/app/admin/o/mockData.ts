// Mock data for admin orders page
// This file will be removed when connected to the database

export type OrderStatus = 'PENDING' | 'REQUESTED' | 'CANCELLING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  productCategory: string;
  productVolume: string;
  quantity: number;
  price: number;
  isFreeSample: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  currency: string;
  lastFour?: string;
  recipientName: string;
  recipientPhone: string | null;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingRegion: string | null;
  shippingPostal: string;
  shippingCountry: string;
  trackingCode: string | null;
  items: OrderItem[];
}

// Mock order items for demo purposes
export const mockOrderItems: OrderItem[] = [
  {
    id: '1',
    productName: 'Icarus',
    productImage: '/uploads/products/product-product-1765956480487-217991313.jpg',
    productCategory: 'Eau de Toilette',
    productVolume: '100ml',
    quantity: 1,
    price: 100,
    isFreeSample: false,
  },
  {
    id: '2',
    productName: 'Antigone',
    productImage: '/uploads/products/product-product-1766110975059-340201118.jpg',
    productCategory: 'Eau de Toilette',
    productVolume: '100ml',
    quantity: 1,
    price: 100,
    isFreeSample: false,
  },
  {
    id: '3',
    productName: 'Narcisse',
    productImage: '/uploads/products/product-product-1766114270046-285173403.jpg',
    productCategory: 'Eau de Toilette',
    productVolume: '100ml',
    quantity: 1,
    price: 110,
    isFreeSample: false,
  },
  {
    id: '4',
    productName: 'Icarus',
    productImage: null,
    productCategory: 'Eau de Toilette',
    productVolume: '5ml',
    quantity: 1,
    price: 0,
    isFreeSample: true,
  },
];
