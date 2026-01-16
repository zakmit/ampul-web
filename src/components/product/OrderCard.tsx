'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { Locale } from '@/i18n/config';

type OrderItem = {
  id: string;
  productName: string;
  productImage: string | null;
  productCategory: string;
  productVolume: string;
  quantity: number;
  price: number;
  isFreeSample?: boolean;
};

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLING' | 'CANCELLED' | 'REQUESTED' | 'REFUNDED';

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
  currency: string;
  status: OrderStatus;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
};

type OrderCardProps = {
  order: Order;
};

export default function OrderCard({ order }: OrderCardProps) {
  const t = useTranslations('OrderCard');
  const params = useParams();
  const locale = params.locale as Locale;
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  // Separate regular items from free samples
  const regularItems = order.items.filter(item => !item.isFreeSample);
  const freeSample = order.items.find(item => item.isFreeSample);

  useEffect(() => {
    setFormattedDate(new Date(order.createdAt).toLocaleDateString());
  }, [order.createdAt]);

  return (
    <div className="">
      {/* Collapsed View */}
      <div
        className={`${
          isExpanded ? 'bg-gray-700 text-white' : 'bg-gray-100'
        } cursor-pointer transition-all duration-300`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="pl-4 pr-3 lg:pl-8 lg:pr-7 py-2 flex justify-between items-center">
          <h3 className="italic font-bold text-base">{formattedDate}</h3>
          <div className="flex items-center gap-4 lg:gap-8">
            <h3 className={`hidden font-bold italic text-base  ${isExpanded ? "": "lg:inline"}`}>
              {t('total')}: {order.total}{order.currency}
            </h3>
            <div className="flex items-center gap-2">
              <h4 className="text-sm italic lg:text-base text-end w-30 lg:w-34">
                {t(`status.${order.status}`)}
              </h4>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`}/>
            </div>
          </div>
        </div>

        {/* Product thumbnails in collapsed state - only show regular items, not free samples */}
        {!isExpanded && (
          <div className="px-4 lg:px-8 pb-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {regularItems.map((item) => (
                <div key={item.id} className="shrink-0">
                  <div className="w-28 h-28 lg:w-32 lg:h-32 bg-gray-300 relative">
                    <Image
                      src={item.productImage || '/placeholder.jpg'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right mt-2 lg:hidden">
              <span className="text-sm italic">{t('total')}: {order.total}{order.currency}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-gray-100 px-4 lg:px-8 py-6 lg:grid lg:grid-cols-3 lg:gap-2">
          <div className='lg:col-span-2'>
            {/* Product List */}
            <h3 className="text-base lg:text-xl font-bold italic mb-4">{t('orderId')}: {order.orderNumber}</h3>
            <div className="space-y-4 mb-8">
              {regularItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-28 h-28 lg:w-32 lg:h-32 bg-gray-300 relative shrink-0">
                    <Image
                      src={item.productImage || '/placeholder.jpg'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold max-w-24 lg:max-w-full">{item.productName}</h3>
                      <p className="text-sm max-w-24 lg:max-w-full">{item.productCategory}</p>
                      <p className="text-sm max-w-24 lg:max-w-full">{item.productVolume}</p>
                    </div>
                    <p className="text-sm lg:text-lg text-right">x{item.quantity}</p>
                    <p className="text-sm lg:text-lg text-right">{item.price}{order.currency}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Free Sample */}
            {freeSample && (
              <div className="mb-6 mx-1 lg:mb-10">
                <div className="flex justify-between items-center text-sm italic">
                  <span>{t('freeSample')}</span>
                  <span>{freeSample.productName}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="text-right mb-8">
              <h3 className="text-base lg:text-lg italic font-bold">{t('total')}: {order.total}{order.currency}</h3>
            </div>
          </div>
          <div className='lg:col-span-1'>
            {/* Shipping and Payment Info */}
            <div className="grid grid-flow-col gap-8 mb-8 mx-2 lg:mr-0 lg:ml-4">
              <div>
                <h4 className="text-base font-bold mb-2 italic">{t('shipTo')}</h4>
                <div className='text-sm ml-2'>
                  <p>{order.recipientName}</p>
                  {order.recipientPhone && <p>{order.recipientPhone}</p>}
                  {(() => {
                    switch (locale) {
                      case 'tw':
                        return (
                          <>
                            <p>
                              {order.shippingPostal} {order.shippingRegion && `${order.shippingRegion} `} {order.shippingCity}
                            </p>
                            <p>{order.shippingLine1}</p>
                            {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                            <p>{order.shippingCountry}</p>
                          </>
                        )
                      case 'fr':
                        return (
                          <>
                            <p>{order.shippingLine1}</p>
                            {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                            <p>
                              {order.shippingPostal} {order.shippingCity}{order.shippingRegion && ` ${order.shippingRegion}`}
                            </p>
                            <p>{order.shippingCountry}</p>
                          </>
                        )
                      default:
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
                        )
                    }
                  })()}
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <h4 className="text-base font-bold italic mb-2">{t('payment')}</h4>
                  <p className="text-sm ml-2">
                    {order.paymentMethod === 'demo'
                      ? t('cardEndingIn', { last4: '4242' })
                      : order.paymentMethod
                    }
                  </p>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold mb-1 italic">{t('tracking')}</h4>
                    <p className="text-sm ml-2">{order.trackingCode || t('trackingNotAvailable')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            {order.status === 'PROCESSING' && (
              <div className="flex justify-center">
                <button className="bg-gray-700 text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors">
                  {t('cancelOrder')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
