'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrderTable, type OrderTableItem, type OrderStatus } from './OrderTable';
import { EditOrderModal, type OrderData } from './EditOrderModal';
import { EditAddressModal, type AddressData, type AddressFieldErrors } from './EditAddressModal';

// Import types for server actions
import type {
  readOrder,
  updateTrackingCode,
  updateOrderStatus,
  updateOrderAddress,
  acceptCancelRequest,
  acceptRefundRequest,
} from '@/app/admin/o/actions';

interface ServerActions {
  fetchOrder: typeof readOrder;
  updateTrackingCode: typeof updateTrackingCode;
  updateOrderStatus: typeof updateOrderStatus;
  updateOrderAddress: typeof updateOrderAddress;
  acceptCancelRequest: typeof acceptCancelRequest;
  acceptRefundRequest: typeof acceptRefundRequest;
}

interface UserOrdersModalProps {
  isOpen: boolean;
  userName: string;
  orders: OrderTableItem[];
  onClose: () => void;
  serverActions?: ServerActions | null;
}

export function UserOrdersModal({
  isOpen,
  userName,
  orders,
  onClose,
  serverActions,
}: UserOrdersModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [modifyOrderModalOpen, setModifyOrderModalOpen] = useState(false);
  const [modifyAddressModalOpen, setModifyAddressModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'refund', orderId?: string } | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [ordersList, setOrdersList] = useState<OrderTableItem[]>(orders);
  const [trackingCodes, setTrackingCodes] = useState<Record<string, string>>({});
  const [currentOrderData, setCurrentOrderData] = useState<OrderData | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [addressFieldErrors, setAddressFieldErrors] = useState<AddressFieldErrors>({});
  const [addressSaveLoading, setAddressSaveLoading] = useState(false);

  // Sync ordersList when orders prop changes
  useEffect(() => {
    setOrdersList(orders);
  }, [orders]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(ordersList.length / ITEMS_PER_PAGE);

  // Calculate paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = ordersList.slice(startIndex, endIndex);

  // Generate page numbers to display in pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handleModifyOrder = async (orderId: string) => {
    setCurrentOrderId(orderId);

    if (serverActions) {
      // Fetch full order details from server
      const result = await serverActions.fetchOrder(orderId);
      if (result.success && result.data) {
        setCurrentOrderData(result.data as OrderData);
        setTrackingInput(result.data.trackingCode || '');
        setModifyOrderModalOpen(true);
      } else {
        alert(result.error || 'Failed to load order');
      }
    } else {
      // Mock data behavior
      setTrackingInput(trackingCodes[orderId] || '');
      setModifyOrderModalOpen(true);
    }
  };

  const handleModifyAddress = async (orderId?: string) => {
    // If orderId is provided (called from OrderTable), fetch order data
    // If not provided (called from EditOrderModal), use existing currentOrderData
    if (orderId) {
      setCurrentOrderId(orderId);

      if (serverActions) {
        // Fetch full order details from server
        const result = await serverActions.fetchOrder(orderId);
        if (result.success && result.data) {
          setCurrentOrderData(result.data as OrderData);
          setModifyAddressModalOpen(true);
        } else {
          alert(result.error || 'Failed to load order');
        }
      } else {
        // Mock data behavior
        setModifyAddressModalOpen(true);
      }
    } else {
      // Called from EditOrderModal - currentOrderId and currentOrderData already set
      setModifyAddressModalOpen(true);
    }
  };

  const handleAcceptCancel = (orderId: string) => {
    setConfirmAction({ type: 'cancel', orderId });
    setConfirmModalOpen(true);
  };

  const handleAcceptRefund = (orderId: string) => {
    setConfirmAction({ type: 'refund', orderId });
    setConfirmModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!confirmAction?.orderId) return;

    if (serverActions) {
      // Use server action
      const result = confirmAction.type === 'cancel'
        ? await serverActions.acceptCancelRequest(confirmAction.orderId)
        : await serverActions.acceptRefundRequest(confirmAction.orderId);

      if (result.success) {
        // Update local state
        setOrdersList(prev => prev.map(order => {
          if (order.id === confirmAction.orderId) {
            return {
              ...order,
              status: confirmAction.type === 'cancel' ? 'CANCELLED' : 'REFUNDED'
            };
          }
          return order;
        }));
        setConfirmModalOpen(false);
        setConfirmAction(null);
      } else {
        alert(result.error || 'Failed to update order status');
      }
    } else {
      // Mock data behavior
      setOrdersList(prev => prev.map(order => {
        if (order.id === confirmAction.orderId) {
          return {
            ...order,
            status: confirmAction.type === 'cancel' ? 'CANCELLED' : 'REFUNDED'
          };
        }
        return order;
      }));
      setConfirmModalOpen(false);
      setConfirmAction(null);
    }
  };

  const handleSaveTrackingCode = async () => {
    if (!currentOrderId || !currentOrderData) return;

    const trimmedCode = trackingInput.trim();
    if (trimmedCode.length === 0 || trimmedCode.length > 50 || !/^[a-zA-Z0-9-]+$/.test(trimmedCode)) {
      alert('Invalid tracking code. Must be 1-50 characters and contain only letters, numbers, and hyphens.');
      return;
    }

    if (serverActions) {
      // Use server action
      const result = await serverActions.updateTrackingCode(currentOrderId, trimmedCode);
      if (result.success) {
        setTrackingCodes(prev => ({ ...prev, [currentOrderId]: trimmedCode }));
        // Only update status to SHIPPED if currently PENDING
        const newStatus: OrderStatus = currentOrderData.status === 'PENDING' ? 'SHIPPED' : currentOrderData.status;
        setOrdersList(prev => prev.map(order =>
          order.id === currentOrderId ? { ...order, status: newStatus } : order
        ));
        // Update current order data as well
        setCurrentOrderData(prev => prev ? { ...prev, status: newStatus, trackingCode: trimmedCode } : null);
        setModifyOrderModalOpen(false);
      } else {
        alert(result.error || 'Failed to update tracking code');
      }
    } else {
      // Mock data behavior
      setTrackingCodes(prev => ({ ...prev, [currentOrderId]: trimmedCode }));
      const newStatus: OrderStatus = currentOrderData.status === 'PENDING' ? 'SHIPPED' : currentOrderData.status;
      setOrdersList(prev => prev.map(order =>
        order.id === currentOrderId ? { ...order, status: newStatus } : order
      ));
      setCurrentOrderData(prev => prev ? { ...prev, status: newStatus, trackingCode: trimmedCode } : null);
      setModifyOrderModalOpen(false);
    }
  };

  const handleUpdateOrderStatus = async (updates: Partial<OrderData>) => {
    if (!currentOrderId || !updates.status) return;

    if (serverActions) {
      setStatusUpdateLoading(true);
      setStatusUpdateError(null);

      // Use server action
      const result = await serverActions.updateOrderStatus(currentOrderId, updates.status);

      setStatusUpdateLoading(false);

      if (result.success) {
        setOrdersList(prev => prev.map(order =>
          order.id === currentOrderId ? { ...order, ...updates } : order
        ));
        // Also update current order data to reflect the change
        setCurrentOrderData(prev => prev ? { ...prev, ...updates } : null);
      } else {
        setStatusUpdateError(result.error || 'Failed to update order status');
      }
    } else {
      // Mock data behavior
      setOrdersList(prev => prev.map(order =>
        order.id === currentOrderId ? { ...order, ...updates } : order
      ));
      setCurrentOrderData(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleUpdateAddress = (updates: Partial<AddressData>) => {
    // Just update local state, don't save yet
    setCurrentOrderData(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleSaveAddress = async () => {
    if (!currentOrderId || !currentOrderData) return;

    // Clear previous errors
    setAddressFieldErrors({});

    if (serverActions) {
      // Client-side validation for required fields
      const errors: AddressFieldErrors = {};
      if (!currentOrderData.recipientName) errors.recipientName = 'Recipient name is required';
      if (!currentOrderData.shippingLine1) errors.shippingLine1 = 'Street address is required';
      if (!currentOrderData.shippingCity) errors.shippingCity = 'City is required';
      if (!currentOrderData.shippingPostal) errors.shippingPostal = 'Postal code is required';
      if (!currentOrderData.shippingCountry) errors.shippingCountry = 'Country is required';

      if (Object.keys(errors).length > 0) {
        setAddressFieldErrors(errors);
        return;
      }

      setAddressSaveLoading(true);
      // Merge updates with current data to ensure all required fields are present
      const addressData = {
        recipientName: currentOrderData.recipientName ?? '',
        recipientPhone: currentOrderData.recipientPhone,
        shippingLine1: currentOrderData.shippingLine1 ?? '',
        shippingLine2: currentOrderData.shippingLine2,
        shippingCity: currentOrderData.shippingCity ?? '',
        shippingRegion: currentOrderData.shippingRegion,
        shippingPostal: currentOrderData.shippingPostal ?? '',
        shippingCountry: currentOrderData.shippingCountry ?? '',
      };

      // Use server action
      const result = await serverActions.updateOrderAddress(currentOrderId, addressData);
      setAddressSaveLoading(false);

      if (result.success) {
        setAddressFieldErrors({});
        setModifyAddressModalOpen(false);
      } else {
        // Handle server validation errors
        const resultData = result.data as { fieldErrors?: Record<string, string> } | undefined;
        if (resultData?.fieldErrors) {
          setAddressFieldErrors(resultData.fieldErrors as AddressFieldErrors);
        }
      }
    } else {
      // Mock data behavior - just close modal
      setModifyAddressModalOpen(false);
    }
  };

  const getCurrentOrder = (): OrderData | null => {
    // If we have fetched order data from server, use that
    if (serverActions && currentOrderData) {
      return currentOrderData;
    }

    // Otherwise, use mock data
    const order = currentOrderId ? ordersList.find(o => o.id === currentOrderId) : null;
    if (!order) return null;

    // Extend with modal-specific fields for demo
    return {
      ...order,
      customerEmail: 'demo@example.com',
      recipientName: 'Apollodorus',
      recipientPhone: '+44912345678',
      shippingLine1: 'No.42, Rue de Rivoli',
      shippingLine2: '',
      shippingCity: 'Paris',
      shippingRegion: '',
      shippingPostal: '75005',
      shippingCountry: 'France',
      trackingCode: trackingCodes[order.id] || null,
      lastFour: '4242',
      items: [],
    };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Confirm Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 transition-all duration-500 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {confirmAction?.type === 'cancel' ? 'Accept Cancel Request' : 'Accept Refund Request'}
            </h3>
            <p className="mb-6">
              Are you sure you want to {confirmAction?.type === 'cancel' ? 'cancel' : 'refund'} this order?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-6 py-2 bg-gray-700 text-white hover:bg-gray-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <EditAddressModal
        isOpen={modifyAddressModalOpen}
        address={getCurrentOrder()}
        onClose={() => {
          setModifyAddressModalOpen(false);
          setAddressFieldErrors({});
        }}
        onSave={handleSaveAddress}
        onUpdateAddress={handleUpdateAddress}
        fieldErrors={addressFieldErrors}
        isLoading={addressSaveLoading}
      />

      <EditOrderModal
        isOpen={modifyOrderModalOpen}
        order={getCurrentOrder()}
        trackingInput={trackingInput}
        onClose={() => setModifyOrderModalOpen(false)}
        onUpdateOrder={handleUpdateOrderStatus}
        onUpdateTrackingInput={setTrackingInput}
        onSaveTrackingCode={handleSaveTrackingCode}
        onOpenAddressModal={() => handleModifyAddress()}
        onAcceptRequest={(type) => {
          if (type === 'cancel') {
            handleAcceptCancel(currentOrderId!);
          } else {
            handleAcceptRefund(currentOrderId!);
          }
        }}
        statusUpdateLoading={statusUpdateLoading}
        statusUpdateError={statusUpdateError}
      />

      <div
        className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-40 transition-all duration-500 flex items-center justify-center overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 w-full max-w-5xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Orders</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Orders Table */}
          <div className="mb-6">
            <OrderTable
              orders={paginatedOrders}
              onModifyOrder={handleModifyOrder}
              onModifyAddress={handleModifyAddress}
              onAcceptCancel={handleAcceptCancel}
              onAcceptRefund={handleAcceptRefund}
              emptyMessage={`No orders found for ${userName}`}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 hover:bg-gray-300 rounded-full disabled:opacity-50"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-2 py-1 text-sm ${
                      currentPage === page
                        ? 'font-bold bg-gray-700 text-gray-100'
                        : 'hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 hover:bg-gray-300 rounded-full disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
