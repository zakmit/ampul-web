'use client';

import Image from 'next/image';
import {X} from 'lucide-react';

const INPUT_STYLE = "w-full text-sm px-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '12px 12px',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

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

export interface OrderData {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail?: string;
  status: OrderStatus;
  total: number;
  currency: string;
  lastFour?: string;
  recipientName?: string;
  recipientPhone?: string | null;
  shippingLine1?: string;
  shippingLine2?: string | null;
  shippingCity?: string;
  shippingRegion?: string | null;
  shippingPostal?: string;
  shippingCountry?: string;
  trackingCode?: string | null;
  items?: OrderItem[];
}

interface EditOrderModalProps {
  isOpen: boolean;
  order: OrderData | null;
  trackingInput: string;
  onClose: () => void;
  onUpdateOrder: (updates: Partial<OrderData>) => void;
  onUpdateTrackingInput: (value: string) => void;
  onSaveTrackingCode: () => void;
  onOpenAddressModal: () => void;
  onAcceptRequest: (type: 'cancel' | 'refund') => void;
  statusUpdateLoading?: boolean;
  statusUpdateError?: string | null;
}

export function EditOrderModal({
  isOpen,
  order,
  trackingInput,
  onClose,
  onUpdateOrder,
  onUpdateTrackingInput,
  onSaveTrackingCode,
  onOpenAddressModal,
  onAcceptRequest,
  statusUpdateLoading = false,
  statusUpdateError = null,
}: EditOrderModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-70 transition-all duration-500 flex items-center justify-center overflow-y-auto"
      onClick={statusUpdateLoading ? undefined : onClose}
    >
      <div
        className="bg-gray-100 max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Date and Status */}
        <div className="flex justify-between items-center pl-2 pr-3 bg-gray-700 ">
          <h3 className="text-base font-bold italic text-gray-100">{formatDate(order.createdAt)}</h3>
          <div className='flex items-center justify-center gap-2'>
            <select
              value={order.status}
              onChange={(e) => onUpdateOrder({ status: e.target.value as OrderStatus })}
              disabled={statusUpdateLoading}
              style={selectStyle}
              className={`my-1 px-3 py-1 pr-8 bg-gray-100 border-none appearance-none text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900 ${statusUpdateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="PENDING">PENDING</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="CANCELLING">CANCELLING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
            <button onClick={onClose} disabled={statusUpdateLoading} className="text-gray-100 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Error notification */}
        {statusUpdateError && (
          <div className="mx-4 mt-4 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {statusUpdateError}
          </div>
        )}
        <div className="px-4 py-6">
          {/* Order ID */}
          <h3 className="text-base font-bold italic mb-4">Order ID: {order.orderNumber}</h3>

          {/* Product Items */}
          <div className="space-y-4 mb-4 max-h-44 lg:max-h-60 overflow-y-auto">
            {order.items?.filter(item => !item.isFreeSample).map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="w-28 h-28 bg-gray-300 shrink-0 relative">
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{item.productName}</h3>
                    <p className="text-sm">{item.productCategory}</p>
                    <p className="text-sm">{item.productVolume}</p>
                  </div>
                  <p className="text-sm">x{item.quantity}</p>
                  <p className="text-sm">{item.price}{order.currency}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Free Sample */}
          {order.items?.find(item => item.isFreeSample) && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm italic">
                <span>Free Sample</span>
                <span>{order.items.find(item => item.isFreeSample)!.productName}</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="text-right mb-4">
            <h3 className="text-lg italic font-bold">TOTAL: {order.total}{order.currency}</h3>
          </div>

          {/* Ship To and Payment/Shipping Section */}
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <h4 className="text-base font-bold italic mb-2">SHIP TO</h4>
              <div className="text-sm ml-2 space-y-1">
                <p>{order.recipientName}</p>
                {order.recipientPhone && <p>{order.recipientPhone}</p>}
                {(() => {
                  // Use currency to determine locale formatting
                  const currency = order.currency;
                  if (currency === 'NT$') {
                    // Taiwan format
                    return (
                      <>
                        <p>
                          {order.shippingPostal} {order.shippingRegion && `${order.shippingRegion} `}{order.shippingCity}
                        </p>
                        <p>{order.shippingLine1}</p>
                        {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                        <p>{order.shippingCountry}</p>
                      </>
                    );
                  } else if (currency === '€') {
                    // France format
                    return (
                      <>
                        <p>{order.shippingLine1}</p>
                        {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                        <p>
                          {order.shippingPostal} {order.shippingCity}
                        </p>
                        {order.shippingRegion && <p>{order.shippingRegion}</p>}
                        <p>{order.shippingCountry}</p>
                      </>
                    );
                  } else {
                    // Default format (US, UK, etc.)
                    return (
                      <>
                        <p>{order.shippingLine1}</p>
                        {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                        <p>
                          {order.shippingCity}
                          {order.shippingRegion && `, ${order.shippingRegion}`} {order.shippingPostal}
                        </p>
                        <p>{order.shippingCountry}</p>
                      </>
                    );
                  }
                })()}
              </div>
              <button
                onClick={onOpenAddressModal}
                className="mx-auto mt-3 px-4 py-2 border border-gray-700 text-sm hover:bg-gray-100"
              >
                Edit Address
              </button>
            </div>

            <div>
              <div className="mb-4">
                <h4 className="text-base font-bold italic mb-1">PAYMENT</h4>
                <p className="text-sm ml-2">Card ending in {order.lastFour || '4242'}</p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-base font-bold italic">SHIPPING</h4>
                <input
                  type="text"
                  placeholder="Tracking Code"
                  value={trackingInput}
                  onChange={(e) => onUpdateTrackingInput(e.target.value)}
                  className={INPUT_STYLE}
                />
                <div className="w-full flex justify-center">
                  <button
                    onClick={onSaveTrackingCode}
                    className="w-30 px-4 py-1 text-sm bg-gray-700 text-gray-100 hover:bg-gray-900"
                  >
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-300">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white hover:bg-gray-900"
            >
              CLOSE
            </button>
            {(order.status === 'REQUESTED' || order.status === 'CANCELLING') && (
              <button
                onClick={() => {
                  const type = order.status === 'CANCELLING' ? 'cancel' : 'refund';
                  onAcceptRequest(type);
                  onClose();
                }}
                className="px-6 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-red-100"
              >
                Accept Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
