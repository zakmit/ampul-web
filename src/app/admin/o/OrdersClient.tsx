'use client';

import { useState, useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/shadcn/dropdown-menu';
import { ChevronLeft, ChevronRight, Plus, Minus, MoreHorizontal, ChevronDown, X, MoveDown, MoveUp, EllipsisVertical } from 'lucide-react';
import { readProducts, readOrders, readOrder, updateTrackingCode, updateOrderStatus, updateOrderAddress, acceptCancelRequest, acceptRefundRequest, type OrderFilters, type OrderDetail } from './actions';
import type { Order as FullOrder, OrderStatus } from './mockData';
import { mockOrderItems } from './mockData';
import { EditOrderModal, type OrderData } from '@/components/ui/EditOrderModal';
import { EditAddressModal, type AddressData } from '@/components/ui/EditAddressModal';
import { formatOrderDate } from '@/lib/formatters';

// Type for table display (from _data/mockOrders.ts)
interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  status: OrderStatus;
  total: number;
  currency: string;
}

const INPUT_STYLE = "w-full max-w-40 sm:max-w-80 lg:max-w-42 text-sm px-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"

// Searchable Dropdown Component for Products
function ProductSearchableDropdown({
  selectedIds,
  items,
  onToggle,
  placeholder = 'Search products...',
}: {
  selectedIds: string[];
  items: { id: string; label: string }[];
  onToggle: (id: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Display selected items with X buttons */}
      <div
        className="min-h-8 border border-gray-300 rounded-md px-2 py-2 cursor-pointer flex overflow-x-auto gap-1 bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItems.map(item => (
          <span
            key={item.id}
            className="inline-flex items-center gap-0.5 bg-olive-200 border rounded-md text-olive-900 border-olive-600 px-1 text-xs whitespace-nowrap"
          >
            {item.label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item.id);
              }}
              className="text-gray-700 hover:text-gray-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {selectedItems.length === 0 && (
          <span className="text-gray-500 text-center italic text-sm">{placeholder}</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 placeholder:italic focus:ring-gray-900"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="p-1">
            {filteredItems.length === 0 ? (
              <div className="text-sm text-gray-500 p-2">No results found</div>
            ) : (
              filteredItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(item.id);
                  }}
                  className={`w-full text-left text-sm px-3 py-2 hover:bg-olive-300 rounded-md ${
                    selectedIds.includes(item.id) ? 'bg-olive-100 font-bold' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface AddressCondition {
  id: string;
  type: 'line1' | 'line2' | 'city' | 'region' | 'postal' | 'country';
  value: string;
}

interface ServerActions {
  fetchOrders: typeof readOrders;
  fetchOrder: typeof readOrder;
  updateTrackingCode: typeof updateTrackingCode;
  updateOrderStatus: typeof updateOrderStatus;
  updateOrderAddress: typeof updateOrderAddress;
  acceptCancelRequest: typeof acceptCancelRequest;
  acceptRefundRequest: typeof acceptRefundRequest;
}

interface OrdersClientProps {
  initialOrders: Order[];
  serverActions?: ServerActions | null;
}

export default function OrdersClient({ initialOrders, serverActions }: OrdersClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('THIS MONTH');
  const [searchColumn, setSearchColumn] = useState('Order ID');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Temporary input value before Enter
  const [activeStatuses, setActiveStatuses] = useState<OrderStatus[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // Modal states
  const [modifyOrderModalOpen, setModifyOrderModalOpen] = useState(false);
  const [modifyAddressModalOpen, setModifyAddressModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'refund', orderId?: string, isBulk?: boolean } | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Order management state - update orders directly
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [trackingCodes, setTrackingCodes] = useState<Record<string, string>>({});
  const [trackingInput, setTrackingInput] = useState('');
  const [serverTotalCount, setServerTotalCount] = useState<number | null>(null);

  // Full order data for modal (fetched when opening modal)
  const [currentOrderData, setCurrentOrderData] = useState<OrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const result = await readProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      }
    };
    fetchProducts();
  }, []);

  // Handle Enter key to trigger search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }
  };
  const [visibleColumns, setVisibleColumns] = useState(['Order ID', 'Date', 'Costumer', 'Status', 'Total']);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'Date' | 'Status'>('Date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // desc = new to old (move-down)

  // Date filter (temporary values before apply)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Total filter (temporary values before apply)
  const [totalMax, setTotalMax] = useState('');
  const [totalMin, setTotalMin] = useState('');
  const [totalCurrency, settotalCurrency] = useState('');
  // Applied filter values (used for actual filtering)
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [appliedTotalMax, setAppliedTotalMax] = useState('');
  const [appliedTotalMin, setAppliedTotalMin] = useState('');
  const [appliedTotalCurrency, setAppliedTotalCurrency] = useState('');

  // Address filters (can have multiple) - temporary before apply
  const [addressConditions, setAddressConditions] = useState<AddressCondition[]>([
    { id: '1', type: 'line1', value: '' }
  ]);

  // Product filter - simplified to single filter with multiple products
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Applied product filter
  const [appliedProductIds, setAppliedProductIds] = useState<string[]>([]);

  // Products list for dropdown
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  // Applied address conditions
  const [appliedAddressConditions, setAppliedAddressConditions] = useState<AddressCondition[]>([]);

  // Status priority for sorting (lower number = higher priority, needs processing)
  const statusPriority: Record<OrderStatus, number> = {
    'PENDING': 1,
    'REQUESTED': 2,
    'CANCELLING': 3,
    'SHIPPED': 4,
    'DELIVERED': 5,
    'CANCELLED': 6,
    'REFUNDED': 7,
  };

  // Fetch orders from server when filters change (only if serverActions is available)
  useEffect(() => {
    if (!serverActions?.fetchOrders) return;

    const loadOrders = async () => {
      const filters: OrderFilters = {
        timeRange: timeRange as OrderFilters['timeRange'],
        searchColumn: searchColumn as OrderFilters['searchColumn'],
        searchQuery: searchQuery || undefined,
        statuses: activeStatuses.length > 0 ? activeStatuses : undefined,
        dateFrom: appliedDateFrom || undefined,
        dateTo: appliedDateTo || undefined,
        totalMin: appliedTotalMin ? parseFloat(appliedTotalMin) : undefined,
        totalMax: appliedTotalMax ? parseFloat(appliedTotalMax) : undefined,
        totalCurrency: appliedTotalCurrency || undefined,
        addressConditions: appliedAddressConditions.length > 0 ? appliedAddressConditions : undefined,
        productIds: appliedProductIds.length > 0 ? appliedProductIds : undefined,
        sortColumn: sortColumn as OrderFilters['sortColumn'],
        sortDirection: sortDirection as OrderFilters['sortDirection'],
        page: currentPage,
        limit: 20,
      };

      const result = await serverActions.fetchOrders(filters);

      if (result.success && result.data) {
        setOrders(result.data.orders as Order[]);
        setServerTotalCount(result.data.totalCount);
      }
    };

    loadOrders();
  }, [
    serverActions,
    timeRange,
    searchColumn,
    searchQuery,
    activeStatuses,
    appliedDateFrom,
    appliedDateTo,
    appliedTotalMin,
    appliedTotalMax,
    appliedTotalCurrency,
    appliedAddressConditions,
    appliedProductIds,
    sortColumn,
    sortDirection,
    currentPage,
  ]);

  // Sort handler
  const handleSort = (column: 'Date' | 'Status') => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with default direction
      setSortColumn(column);
      setSortDirection('desc'); // Both default to desc (Date: new to old, Status: important to not important)
    }
  };

  // When using server-side fetching, skip client-side filtering
  // The server already applies all filters
  const shouldUseClientFiltering = !serverActions;

  // Filter orders by time range
  const getTimeRangeFilteredOrders = () => {
    if (!shouldUseClientFiltering) return orders;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timeRange) {
      case 'TODAY':
        return orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });
      case '7 DAYS':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return orders.filter(order => new Date(order.createdAt) >= sevenDaysAgo);
      case '1 MONTH':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return orders.filter(order => new Date(order.createdAt) >= oneMonthAgo);
      case 'THIS MONTH':
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders.filter(order => new Date(order.createdAt) >= thisMonthStart);
      case '3 MONTHS':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return orders.filter(order => new Date(order.createdAt) >= threeMonthsAgo);
      case 'THIS YEAR':
        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        return orders.filter(order => new Date(order.createdAt) >= thisYearStart);
      case 'ALL':
      default:
        return orders;
    }
  };

  const timeFilteredOrders = getTimeRangeFilteredOrders();

  // Apply advanced filters (date, total)
  const advancedFilteredOrders = shouldUseClientFiltering ? timeFilteredOrders.filter(order => {
    // Date filter
    if (appliedDateFrom && new Date(order.createdAt) < new Date(appliedDateFrom)) {
      return false;
    }
    if (appliedDateTo && new Date(order.createdAt) > new Date(appliedDateTo + 'T23:59:59')) {
      return false;
    }

    // Total filter
    if (appliedTotalMin && order.total < parseFloat(appliedTotalMin)) {
      return false;
    }
    if (appliedTotalMax && order.total > parseFloat(appliedTotalMax)) {
      return false;
    }

    // Currency filter
    if (appliedTotalCurrency && order.currency !== appliedTotalCurrency) {
      return false;
    }

    return true;
  }) : timeFilteredOrders;

  // Apply search filter
  const searchFilteredOrders = shouldUseClientFiltering ? advancedFilteredOrders.filter(order => {
    if (!searchQuery.trim()) {
      return true;
    }

    const query = searchQuery.toLowerCase().trim();

    if (searchColumn === 'Order ID') {
      return order.orderNumber.toLowerCase().includes(query);
    }
    // E-mail search not implemented for mock data
    // Will be implemented when connected to database

    return true;
  }) : advancedFilteredOrders;

  // Filter orders by status (show all if activeStatuses is empty or has all statuses)
  const allStatuses: OrderStatus[] = ['PENDING', 'REQUESTED', 'CANCELLING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  const filteredOrders = shouldUseClientFiltering && (activeStatuses.length === 0 || activeStatuses.length === allStatuses.length)
    ? searchFilteredOrders
    : shouldUseClientFiltering
    ? searchFilteredOrders.filter(order => activeStatuses.includes(order.status))
    : searchFilteredOrders;

  // Sort orders
  const sortedOrders = shouldUseClientFiltering ? [...filteredOrders].sort((a, b) => {
    if (sortColumn === 'Date') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    } else {
      // Status sorting
      const priorityA = statusPriority[a.status];
      const priorityB = statusPriority[b.status];
      return sortDirection === 'desc' ? priorityA - priorityB : priorityB - priorityA;
    }
  }) : filteredOrders;

  // Pagination constants
  const ITEMS_PER_PAGE = 20;

  // When using server-side fetching, pagination is handled by the server
  // so we don't slice the data client-side
  const paginatedOrders = shouldUseClientFiltering ? (() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedOrders.slice(startIndex, endIndex);
  })() : sortedOrders;

  // Calculate total pages for display
  // Use serverTotalCount when available (server-side), otherwise use sortedOrders.length (client-side)
  const totalPages = serverTotalCount !== null
    ? Math.ceil(serverTotalCount / ITEMS_PER_PAGE)
    : Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);

  const statusColors = {
    PENDING: 'border-blue-500 text-blue-900 bg-blue-200 hover:bg-blue-600 hover:text-blue-100',
    SHIPPED: 'border-olive-600 text-olive-900 bg-olive-200 hover:bg-olive-600 hover:text-olive-100',
    DELIVERED: 'border-gray-600 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-gray-100',
    CANCELLING: 'border-red-600 text-red-900 bg-red-200 hover:bg-red-600 hover:text-red-100',
    CANCELLED: 'border-gray-600 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-gray-100',
    REQUESTED: 'border-yellow-500 text-yellow-900 bg-yellow-200 hover:bg-yellow-500 hover:text-yellow-100',
    REFUNDED: 'border-gray-600 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-gray-100',
  };

  const toggleStatus = (status: OrderStatus) => {
    if (activeStatuses.includes(status)) {
      setActiveStatuses(activeStatuses.filter(s => s !== status));
    } else {
      setActiveStatuses([...activeStatuses, status]);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Address condition handlers
  const addAddressCondition = () => {
    setAddressConditions([...addressConditions, { id: Date.now().toString(), type: 'region', value: '' }]);
  };

  const removeAddressCondition = (id: string) => {
    setAddressConditions(addressConditions.filter(c => c.id !== id));
  };

  const updateAddressCondition = (id: string, updates: Partial<AddressCondition>) => {
    setAddressConditions(addressConditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Product filter handler
  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Apply filters
  const handleApplyFilters = () => {
    // If date filters are set, change time range to ALL
    if (dateFrom || dateTo) {
      setTimeRange('ALL');
    }

    // Apply all filter values
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedTotalMax(totalMax);
    setAppliedTotalMin(totalMin);
    setAppliedTotalCurrency(totalCurrency);
    setAppliedAddressConditions(addressConditions.filter(c => c.value.trim() !== ''));
    setAppliedProductIds(selectedProductIds);

    // Reset to first page when applying filters
    setCurrentPage(1);

    // Close mobile filter panel
    setIsFilterOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    // Clear temporary filter values
    setDateFrom('');
    setDateTo('');
    setTotalMax('');
    setTotalMin('');
    settotalCurrency('');
    setAddressConditions([{ id: '1', type: 'line1', value: '' }]);
    setSelectedProductIds([]);

    // Clear applied filter values
    setAppliedTotalCurrency('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setAppliedTotalMax('');
    setAppliedTotalMin('');
    setAppliedAddressConditions([]);
    setAppliedProductIds([]);

    // Reset to first page
    setCurrentPage(1);

    // Close mobile filter panel
    setIsFilterOpen(false);
  };

  // Selection handlers
  const handleToggleOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0) {
      // If all current page orders are selected, deselect all
      setSelectedOrders(new Set());
    } else {
      // Select all current page orders
      setSelectedOrders(new Set(paginatedOrders.map(order => order.id)));
    }
  };

  // Check if all current page orders are selected
  const allCurrentPageSelected = paginatedOrders.length > 0 &&
    paginatedOrders.every(order => selectedOrders.has(order.id));

  // Check if some (but not all) current page orders are selected
  const someCurrentPageSelected = paginatedOrders.some(order => selectedOrders.has(order.id)) &&
    !allCurrentPageSelected;

  // Handle dropdown menu actions
  const handleModifyOrder = async (orderId: string) => {
    setCurrentOrderId(orderId);

    if (serverActions) {
      // Fetch full order data from server
      setIsLoadingOrder(true);
      const result = await serverActions.fetchOrder(orderId);
      setIsLoadingOrder(false);

      if (result.success && result.data) {
        setCurrentOrderData(result.data);
        // Set tracking input from fetched order data
        setTrackingInput(result.data.trackingCode || '');
        setModifyOrderModalOpen(true);
      } else {
        alert(result.error || 'Failed to load order');
      }
    } else {
      // Mock data - extend the table order with modal-specific fields
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const extendedOrder = order as Partial<FullOrder>;
          const hasModalData = extendedOrder.items && extendedOrder.recipientName;

          if (!hasModalData) {
            // Add modal-specific fields for demo
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
              trackingCode: null,
              lastFour: '4242',
              items: mockOrderItems,
            };
          }
        }
        return order;
      }));

      setModifyOrderModalOpen(true);
    }
  };

  const handleModifyAddress = async (orderId: string) => {
    setCurrentOrderId(orderId);

    if (serverActions) {
      // Fetch full order data from server if not already loaded
      if (!currentOrderData || currentOrderData.id !== orderId) {
        setIsLoadingOrder(true);
        const result = await serverActions.fetchOrder(orderId);
        setIsLoadingOrder(false);

        if (result.success && result.data) {
          setCurrentOrderData(result.data);
          setModifyAddressModalOpen(true);
        } else {
          alert(result.error || 'Failed to load order');
        }
      } else {
        // Already have the data, just open modal
        setModifyAddressModalOpen(true);
      }
    } else {
      // Mock data - make sure order has address fields
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const extendedOrder = order as Partial<FullOrder>;
          const hasModalData = extendedOrder.items && extendedOrder.recipientName;

          if (!hasModalData) {
            // Add modal-specific fields for demo
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
              trackingCode: trackingCodes[orderId] || null,
              lastFour: '4242',
              items: mockOrderItems,
            };
          }
        }
        return order;
      }));
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

  const handleBulkAcceptCancel = () => {
    const cancellingOrders = orders.filter(
      order => selectedOrders.has(order.id) && order.status === 'CANCELLING'
    );

    if (cancellingOrders.length === 0) return;

    setConfirmAction({ type: 'cancel', isBulk: true });
    setConfirmModalOpen(true);
  };

  const handleBulkAcceptRefund = () => {
    const requestedOrders = orders.filter(
      order => selectedOrders.has(order.id) && order.status === 'REQUESTED'
    );

    if (requestedOrders.length === 0) return;

    setConfirmAction({ type: 'refund', isBulk: true });
    setConfirmModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!confirmAction) return;

    if (serverActions) {
      // Use server actions for real data
      if (confirmAction.isBulk) {
        // Handle bulk action - iterate through selected orders
        const targetStatus = confirmAction.type === 'cancel' ? 'CANCELLING' : 'REQUESTED';
        const orderIds = Array.from(selectedOrders).filter(id => {
          const order = orders.find(o => o.id === id);
          return order?.status === targetStatus;
        });

        // Process all requests
        const actionFunc = confirmAction.type === 'cancel'
          ? serverActions.acceptCancelRequest
          : serverActions.acceptRefundRequest;

        await Promise.all(orderIds.map(id => actionFunc(id)));

        // Refresh orders list
        const refreshResult = await serverActions.fetchOrders({
          timeRange: timeRange as OrderFilters['timeRange'],
          limit: 20,
        });
        if (refreshResult.success && refreshResult.data) {
          setOrders(refreshResult.data.orders as Order[]);
        }
        setSelectedOrders(new Set());
      } else if (confirmAction.orderId) {
        // Handle single order action
        const actionFunc = confirmAction.type === 'cancel'
          ? serverActions.acceptCancelRequest
          : serverActions.acceptRefundRequest;

        const result = await actionFunc(confirmAction.orderId);
        if (result.success) {
          // Refresh orders list
          const refreshResult = await serverActions.fetchOrders({
            timeRange: timeRange as OrderFilters['timeRange'],
            limit: 20,
          });
          if (refreshResult.success && refreshResult.data) {
            setOrders(refreshResult.data.orders as Order[]);
          }
        } else {
          alert(result.error || 'Failed to process request');
        }
      }
    } else {
      // Mock data behavior
      if (confirmAction.isBulk) {
        const targetStatus = confirmAction.type === 'cancel' ? 'CANCELLING' : 'REQUESTED';
        const newStatus = confirmAction.type === 'cancel' ? 'CANCELLED' : 'REFUNDED';

        setOrders(prev => prev.map(order => {
          if (selectedOrders.has(order.id) && order.status === targetStatus) {
            return { ...order, status: newStatus as OrderStatus };
          }
          return order;
        }));
        setSelectedOrders(new Set());
      } else {
        setOrders(prev => prev.map(order => {
          if (order.id === confirmAction.orderId) {
            return {
              ...order,
              status: confirmAction.type === 'cancel' ? 'CANCELLED' : 'REFUNDED'
            };
          }
          return order;
        }));
      }
    }

    setConfirmModalOpen(false);
    setConfirmAction(null);
  };

  const handleSaveTrackingCode = async () => {
    if (!currentOrderId) return;

    if (serverActions) {
      // Use server action for real data
      const result = await serverActions.updateTrackingCode(currentOrderId, trackingInput);
      if (result.success) {
        // Update local state
        setTrackingCodes(prev => ({ ...prev, [currentOrderId]: trackingInput.trim() }));
        // Refresh orders list
        const refreshResult = await serverActions.fetchOrders({
          timeRange: timeRange as OrderFilters['timeRange'],
          limit: 20,
        });
        if (refreshResult.success && refreshResult.data) {
          setOrders(refreshResult.data.orders as Order[]);
        }
        setModifyOrderModalOpen(false);
      } else {
        alert(result.error || 'Failed to update tracking code');
      }
    } else {
      // Mock data behavior
      const currentOrder = orders.find(o => o.id === currentOrderId);
      if (currentOrder?.status === 'PENDING') {
        const trimmedCode = trackingInput.trim();
        if (trimmedCode.length > 0 && trimmedCode.length <= 50 && /^[a-zA-Z0-9-]+$/.test(trimmedCode)) {
          setTrackingCodes(prev => ({ ...prev, [currentOrderId]: trimmedCode }));
          setOrders(prev => prev.map(order =>
            order.id === currentOrderId ? { ...order, status: 'SHIPPED' as OrderStatus } : order
          ));
          setModifyOrderModalOpen(false);
        }
      } else {
        setModifyOrderModalOpen(false);
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!currentOrderId || !currentOrderData) return;

    if (serverActions) {
      // Use server action for real data - validate required fields
      if (!currentOrderData.recipientName || !currentOrderData.shippingLine1 ||
          !currentOrderData.shippingCity || !currentOrderData.shippingPostal ||
          !currentOrderData.shippingCountry) {
        alert('Please fill in all required fields');
        return;
      }

      const addressData = {
        recipientName: currentOrderData.recipientName,
        recipientPhone: currentOrderData.recipientPhone,
        shippingLine1: currentOrderData.shippingLine1,
        shippingLine2: currentOrderData.shippingLine2,
        shippingCity: currentOrderData.shippingCity,
        shippingRegion: currentOrderData.shippingRegion,
        shippingPostal: currentOrderData.shippingPostal,
        shippingCountry: currentOrderData.shippingCountry,
      };

      const result = await serverActions.updateOrderAddress(currentOrderId, addressData);
      if (result.success) {
        // Refresh order data
        const orderResult = await serverActions.fetchOrder(currentOrderId);
        if (orderResult.success && orderResult.data) {
          setCurrentOrderData(orderResult.data);
        }
        setModifyAddressModalOpen(false);
      } else {
        alert(result.error || 'Failed to update address');
      }
    } else {
      // Mock data behavior - address is already saved to state via form inputs
      setModifyAddressModalOpen(false);
    }
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1em 1em',
  };

  // Generate page numbers to display in pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Get current order for modal - use fetched data if available, otherwise fallback to table data
  const getCurrentOrder = (): (FullOrder | OrderDetail) | null => {
    if (currentOrderData) {
      return currentOrderData;
    }
    const order = currentOrderId ? orders.find(o => o.id === currentOrderId) : null;
    return order as FullOrder | null;
  };

  // Handle status update from modal
  const handleUpdateOrderStatus = async (updates: Partial<OrderData>) => {
    if (!currentOrderId || !updates.status) return;

    if (serverActions) {
      setStatusUpdateLoading(true);
      setStatusUpdateError(null);

      const result = await serverActions.updateOrderStatus(currentOrderId, updates.status);

      setStatusUpdateLoading(false);

      if (result.success) {
        // Update current order data
        if (currentOrderData) {
          setCurrentOrderData({ ...currentOrderData, status: updates.status });
        }
        // Refresh orders list
        const refreshResult = await serverActions.fetchOrders({
          timeRange: timeRange as OrderFilters['timeRange'],
          limit: 20,
        });
        if (refreshResult.success && refreshResult.data) {
          setOrders(refreshResult.data.orders as Order[]);
        }
      } else {
        setStatusUpdateError(result.error || 'Failed to update status');
      }
    } else {
      // Mock data behavior
      setOrders(prev => prev.map(order =>
        order.id === currentOrderId ? { ...order, ...updates } : order
      ));
      if (currentOrderData && updates.status) {
        setCurrentOrderData({ ...currentOrderData, status: updates.status });
      }
    }
  };

  // Handle address update from modal
  const handleUpdateAddress = (updates: Partial<AddressData>) => {
    if (serverActions && currentOrderData) {
      // Update local state immediately for responsive UI
      setCurrentOrderData({ ...currentOrderData, ...updates });
    } else {
      // Mock data behavior
      setOrders(prev => prev.map(order =>
        order.id === currentOrderId ? { ...order, ...updates } : order
      ));
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Confirm Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-30 transition-all duration-500 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {confirmAction?.type === 'cancel' ? 'Accept Cancel Request' : 'Accept Refund Request'}
              {confirmAction?.isBulk && 's'}
            </h3>
            <p className="mb-6">
              Are you sure you want to {confirmAction?.type === 'cancel' ? 'cancel' : 'refund'} {confirmAction?.isBulk ? 'all selected orders' : 'this order'}?
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
        onClose={() => setModifyAddressModalOpen(false)}
        onSave={handleSaveAddress}
        onUpdateAddress={handleUpdateAddress}
      />

      <EditOrderModal
        isOpen={modifyOrderModalOpen}
        order={getCurrentOrder() as OrderData}
        trackingInput={trackingInput}
        onClose={() => {
          setModifyOrderModalOpen(false);
          setStatusUpdateError(null);
        }}
        onUpdateOrder={handleUpdateOrderStatus}
        onUpdateTrackingInput={setTrackingInput}
        onSaveTrackingCode={handleSaveTrackingCode}
        onOpenAddressModal={() => handleModifyAddress(currentOrderId!)}
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

      <div className="lg:grid lg:grid-cols-10 lg:min-h-screen">
        {/* Desktop Filter - 3 columns */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="my-6">
            <h1 className="ml-6 text-4xl font-bold">Orders</h1>
          </div>
              <div className="w-full bg-white border-r border-gray-900 py-6 my-8 overflow-x-clip ">
                <div className="ml-6 flex items-center w-full gap-2 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                    <path d="M5,8l14,0" fill="none" strokeWidth="1.04px"/>
                    <path d="M5,16l14,-0" fill="none" strokeWidth="1.04px"/>
                    <path d="M9.5,7.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                    <path d="M16.5,15.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                  </svg>
                  <h3 className="text-lg font-bold">Filter</h3>
                  <div className="flex items-start">
                    <span className="text-[10px] text-gray-500 italic">*Address and Product filters unavailable for mock data</span>
                  </div>
                </div>
                <div className="w-full flex justify-center items-center flex-col">
                  <div className="space-y-6 px-1 py-1 min-w-75 w-full max-w-90 items-center">
                    {/* Date Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Date</h3>
                      <div className="w-full flex justify-between">
                        <input
                          type="date"
                          placeholder="MM-DD-YYYY"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className={INPUT_STYLE}
                        />
                        <span className="flex items-center text-gray-500">-</span>
                        <input
                          type="date"
                          placeholder="MM-DD-YYYY"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className={INPUT_STYLE}
                        />
                      </div>
                    </div>

                    {/* Total Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Total</h3>
                      <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Maximum"
                          value={totalMax}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              setTotalMax(value);
                            }
                          }}
                          className={INPUT_STYLE + " text-end"}
                        />
                        <span className="flex items-center text-gray-500">-</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Minimum"
                          value={totalMin}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              setTotalMin(value);
                            }
                          }}
                          className={INPUT_STYLE + " text-end"}
                        />
                        <select
                          value={totalCurrency}
                          onChange={(e) => settotalCurrency(e.target.value)}
                          style={selectStyle}
                          className="w-16 px-1 py-2 pr-8 bg-gray-100 border-none appearance-none text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
                        >
                          <option value="">All</option>
                          <option value="$">$</option>
                          <option value="€">€</option>
                          <option value="NT$">NT$</option>
                        </select>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="">
                      <h3 className="text-lg font-semibold mb-4">Address</h3>
                      <div className="space-y-3 overflow-y-auto -mx-1 px-1 -my-1 py-1 max-h-60">
                        {addressConditions.map((condition, index) => (
                          <div key={condition.id} className="flex items-center justify-between">
                            <select
                              value={condition.type}
                              onChange={(e) => updateAddressCondition(condition.id, { type: e.target.value as AddressCondition['type'] })}
                              style={selectStyle}
                              className="w-29 px-3 py-2 pr-8 bg-gray-100 border-none appearance-none text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
                            >
                              <option value="line1">Address 1</option>
                              <option value="line2">Address 2</option>
                              <option value="city">City</option>
                              <option value="region">Region</option>
                              <option value="postal">Postal</option>
                              <option value="country">Country</option>
                            </select>
                            <input
                              type="text"
                              placeholder={
                                condition.type === 'line1' ? 'Address 1' :
                                condition.type === 'line2' ? 'Address 2' :
                                condition.type === 'city' ? 'City' :
                                condition.type === 'region' ? 'Region' :
                                condition.type === 'postal' ? 'Postal' :
                                'Country'
                              }
                              value={condition.value}
                              onChange={(e) => updateAddressCondition(condition.id, { value: e.target.value })}
                              className={INPUT_STYLE}
                            />
                            {index > 0 ? (
                              <button onClick={() => removeAddressCondition(condition.id)} className="text-gray-600 hover:text-gray-900">
                                <Minus className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={addAddressCondition} className="text-gray-600 hover:text-gray-900">
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Product</h3>
                      <ProductSearchableDropdown
                        selectedIds={selectedProductIds}
                        items={products.map(p => ({ id: p.id, label: p.name }))}
                        onToggle={toggleProduct}
                        placeholder="Select products..."
                      />
                    </div>
                  </div>
                  <div className="flex flex-row justify-around w-full">
                    <button
                      onClick={handleApplyFilters}
                      className="w-32 bg-gray-700 text-gray-100 my-6 py-2 px-4 font-semibold hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      APPLY
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="w-32 bg-white text-gray-900 my-6 py-2 px-4 font-semibold border border-gray-700 hover:bg-gray-700 hover:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      RESET
                    </button>
                  </div>
                </div>
              </div>

        </div>

        {/* Main Content - 9 columns */}
        <div className="lg:col-span-7 px-3 lg:p-6">
          <div className="lg:hidden flex flex-col items-center">
            <h1 className="text-3xl font-bold p-6">Orders</h1>
            <div className="lg:hidden w-full flex flex-col items-start gap-2 mb-4 py-2 border-b border-t border-gray-500">
              <div className="flex flex-row justify-between w-full">
                <button
                  onClick={() => isFilterOpen ? setIsFilterOpen(false) : setIsFilterOpen(true)}
                  className="flex items-center gap-2 ml-2 text-sm font-semibold hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                    <path d="M5,8l14,0" fill="none" strokeWidth="1.04px"/>
                    <path d="M5,16l14,-0" fill="none" strokeWidth="1.04px"/>
                    <path d="M9.5,7.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                    <path d="M16.5,15.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                  </svg>
                  <span>Filter</span>
                  <div className="flex items-start">
                    <span className="text-[10px] text-gray-500 italic">*Address and Product filters unavailable for mock data</span>
                  </div>
                </button>
                {isFilterOpen && ( <button onClick={() => setIsFilterOpen(false)} className="text-gray-600 hover:text-gray-900">
                  <X className="w-4 h-4" />
                </button>)}
              </div>
              {/* Mobile Filter Panel */}
              {isFilterOpen && (
                <div className="items-center w-full flex flex-col">
                  <div className="lg:hidden bg-white overflow-y-auto max-h-[50dvh] w-full">
                    <div className="px-2 py-2">
                      {/* Filter Contents */}
                      <div className="w-full flex justify-center">
                        <div className="space-y-6 w-full items-center">
                          {/* Date Section */}
                          <div className="flex flex-row justify-between items-center">
                            <span className="text-base font-semibold">Date</span>
                            <div className="flex gap-2 w-64 sm:w-100">
                              <input
                                type="date"
                                placeholder="MM-DD-YYYY"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full text-sm px-0 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
                              />
                              <span className="flex items-center text-gray-500">-</span>
                              <input
                                type="date"
                                placeholder="MM-DD-YYYY"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full text-sm px-0 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
                              />
                            </div>
                          </div>

                          {/* Total Section */}
                          <div className="flex flex-row justify-between items-center">
                            <span className="text-base font-semibold">Total</span>
                            <div className="flex gap-1 w-64 sm:w-100">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Maximum"
                                value={totalMax}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setTotalMax(value);
                                  }
                                }}
                                className={INPUT_STYLE + " text-end"}
                              />
                              <span className="flex items-center text-gray-500">-</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Minimum"
                                value={totalMin}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setTotalMin(value);
                                  }
                                }}
                                className={INPUT_STYLE + " text-end"}
                              />
                              <select
                                value={totalCurrency}
                                onChange={(e) => settotalCurrency(e.target.value)}
                                style={selectStyle}
                                className="w-16 px-1 py-2 pr-8 bg-gray-100 border-none appearance-none text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
                              >
                                <option value="">All</option>
                                <option value="$">$</option>
                                <option value="€">€</option>
                                <option value="NT$">NT$</option>
                              </select>
                            </div>
                          </div>

                          {/* Address Section */}
                          <div className="flex flex-row justify-between items-start">
                            <span className="text-base font-semibold">Address</span>
                            <div className="space-y-3 w-64 sm:w-100">
                              {addressConditions.map((condition, index) => (
                                <div key={condition.id} className="flex items-center gap-1 sm:justify-between">
                                  <select
                                    value={condition.type}
                                    onChange={(e) => updateAddressCondition(condition.id, { type: e.target.value as AddressCondition['type'] })}
                                    style={selectStyle}
                                    className="w-26 px-3 py-2 pr-8 bg-gray-100 border-none appearance-none text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
                                  >
                                    <option value="line1">Address 1</option>
                                    <option value="line2">Address 2</option>
                                    <option value="city">City</option>
                                    <option value="region">Region</option>
                                    <option value="postal">Postal</option>
                                    <option value="country">Country</option>
                                  </select>
                                  <input
                                    type="text"
                                    placeholder={
                                      condition.type === 'line1' ? 'Address 1' :
                                      condition.type === 'line2' ? 'Address 2' :
                                      condition.type === 'city' ? 'City' :
                                      condition.type === 'region' ? 'Region' :
                                      condition.type === 'postal' ? 'Postal' :
                                      'Country'
                                    }
                                    value={condition.value}
                                    onChange={(e) => updateAddressCondition(condition.id, { value: e.target.value })}
                                    className={INPUT_STYLE}
                                  />
                                  {index > 0 ? (
                                    <button onClick={() => removeAddressCondition(condition.id)} className="text-gray-600 hover:text-gray-900">
                                      <Minus className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button onClick={addAddressCondition} className="text-gray-600 hover:text-gray-900">
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Product Section */}
                          <div className="flex flex-row justify-between items-start">
                            <span className="text-base font-semibold">Product</span>
                            <div className="w-64 sm:w-100">
                              <ProductSearchableDropdown
                                selectedIds={selectedProductIds}
                                items={products.map(p => ({ id: p.id, label: p.name }))}
                                onToggle={toggleProduct}
                                placeholder="Select products..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row justify-around w-full">
                    <button
                      onClick={handleApplyFilters}
                      className="w-36 bg-gray-700 text-sm text-gray-100 my-4 py-2 px-4 font-semibold hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      APPLY
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="w-36 bg-white text-sm text-gray-900 my-4 py-2 px-4 font-semibold border border-gray-700 hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      RESET
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time Range and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-1">
            {/* Time Range Select */}
            <div className="flex flex-row justify-between">
              {/* <div className='flex flex-col justify-between'> */}
                <select
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1em 1em',
                  }}
                  className="px-4 py-1 lg:py-3 pr-16 lg:pr-10 text-sm lg:text-lg bg-gray-100 border border-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold"
                >
                  <option value="TODAY">TODAY</option>
                  <option value="7 DAYS">7 DAYS</option>
                  <option value="1 MONTH">1 MONTH</option>
                  <option value="THIS MONTH">THIS MONTH</option>
                  <option value="3 MONTHS">3 MONTHS</option>
                  <option value="THIS YEAR">THIS YEAR</option>
                  <option value="ALL">ALL</option>
                </select>
              {/* </div> */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex lg:hidden w-28 px-3 py-2 border border-gray-500 rounded-md font-semibold text-sm items-center justify-between hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  Columns
                  <ChevronDown className="w-4 h-4 ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.includes('Date')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setVisibleColumns([...visibleColumns, 'Date']);
                      } else {
                        setVisibleColumns(visibleColumns.filter(col => col !== 'Date'));
                      }
                    }}
                  >
                    Date
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.includes('Costumer')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setVisibleColumns([...visibleColumns, 'Costumer']);
                      } else {
                        setVisibleColumns(visibleColumns.filter(col => col !== 'Costumer'));
                      }
                    }}
                  >
                    Costumer
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.includes('Status')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setVisibleColumns([...visibleColumns, 'Status']);
                      } else {
                        setVisibleColumns(visibleColumns.filter(col => col !== 'Status'));
                      }
                    }}
                  >
                    Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.includes('Total')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setVisibleColumns([...visibleColumns, 'Total']);
                      } else {
                        setVisibleColumns(visibleColumns.filter(col => col !== 'Total'));
                      }
                    }}
                  >
                    Total
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
            <div className='flex flex-col gap-2'>
              {/* Search and Columns */}
              <div className="flex flex-col lg:flex-row gap-2 justify-end items-center">
                {/* Search */}
                <div className="flex w-full gap-2 lg:px-3 py-1.5 lg:border border-gray-500 rounded-md">
                  <select
                    value={searchColumn}
                    onChange={(e) => setSearchColumn(e.target.value)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1em 1em',
                    }}
                    className="px-3 pr-10 py-1 bg-gray-100 rounded-md lg:rounded-xl appearance-none text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="Order ID">Order ID</option>
                    <option value="E-mail">E-mail</option>
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Press Enter to Search"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full pl-10 pr-4 py-1 border rounded-2xl border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                </div>

                {/* Columns Select */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden lg:flex w-32 px-3 py-2 border border-gray-500 rounded-md font-semibold text-sm items-center justify-between hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-900">
                    Columns
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.includes('Date')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setVisibleColumns([...visibleColumns, 'Date']);
                        } else {
                          setVisibleColumns(visibleColumns.filter(col => col !== 'Date'));
                        }
                      }}
                    >
                      Date
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.includes('Costumer')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setVisibleColumns([...visibleColumns, 'Costumer']);
                        } else {
                          setVisibleColumns(visibleColumns.filter(col => col !== 'Costumer'));
                        }
                      }}
                    >
                      Costumer
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.includes('Status')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setVisibleColumns([...visibleColumns, 'Status']);
                        } else {
                          setVisibleColumns(visibleColumns.filter(col => col !== 'Status'));
                        }
                      }}
                    >
                      Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.includes('Total')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setVisibleColumns([...visibleColumns, 'Total']);
                        } else {
                          setVisibleColumns(visibleColumns.filter(col => col !== 'Total'));
                        }
                      }}
                    >
                      Total
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Quick Filter Pills */}
              <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2 border border-gray-500 rounded-sm py-2 lg:border-0 lg:py-0 items-center lg:justify-center">
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setActiveStatuses(['PENDING', 'REQUESTED', 'CANCELLING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']);
                      setCurrentPage(1);
                    }}
                    className="px-1 text-xs border rounded-xs border-gray-900 hover:bg-gray-200 font-medium"
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => {
                      setActiveStatuses([]);
                      setCurrentPage(1);
                    }}
                    className="px-1 text-xs border rounded-xs border-gray-900 hover:bg-gray-200 font-medium"
                  >
                    NONE
                  </button>
                </div>
                <div className='flex gap-2'>
                  {(['PENDING', 'REQUESTED', 'CANCELLING', 'SHIPPED'] as OrderStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-1 text-xs border rounded-xs transition-colors ${
                        activeStatuses.includes(status)
                          ? statusColors[status]
                          : 'border-gray-300 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(['DELIVERED', 'CANCELLED', 'REFUNDED'] as OrderStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-1 text-xs border rounded-xs transition-colors ${
                        activeStatuses.includes(status)
                          ? statusColors[status]
                          : 'border-gray-300 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm mb-2">
            {(() => {
              const totalCount = serverTotalCount !== null ? serverTotalCount : sortedOrders.length;
              return totalCount > 1 ? `${totalCount} orders` : `${totalCount} order`;
            })()}
            <span className="text-gray-500 ml-2">
              {selectedOrders.size > 0 ? `${selectedOrders.size} selected` : ``}
            </span>
            <span className="text-gray-500 italic ml-2">
              (Page {currentPage} of {totalPages})
            </span>
          </div>


          {/* Table - Desktop */}
          <div className="hidden lg:block border border-gray-300">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-100">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-gray-900"
                      checked={allCurrentPageSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someCurrentPageSelected;
                        }
                      }}
                      onChange={handleToggleAll}
                    />
                  </TableHead>
                  {visibleColumns.includes('Order ID') && (
                    <TableHead className="font-semibold">
                        Order ID
                    </TableHead>
                  )}
                  {visibleColumns.includes('Date') && (
                    <TableHead
                      className="font-semibold cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('Date')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortColumn === 'Date' && (
                          sortDirection === 'desc' ? <MoveDown className="w-4 h-4" /> : <MoveUp className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('Costumer') && <TableHead className="font-semibold">Costumer</TableHead>}
                  {visibleColumns.includes('Status') && (
                    <TableHead
                      className="font-semibold cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('Status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortColumn === 'Status' && (
                          sortDirection === 'desc' ? <MoveDown className="w-4 h-4" /> : <MoveUp className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('Total') && <TableHead className="font-semibold">Total</TableHead>}
                  <TableHead className="w-12">
                    {selectedOrders.size > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-gray-200 p-1 rounded">
                          <EllipsisVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {orders.some(order => selectedOrders.has(order.id) && order.status === 'CANCELLING') && (
                            <DropdownMenuItem onClick={handleBulkAcceptCancel} className="text-red-600">
                              Accept All Cancel Requests
                            </DropdownMenuItem>
                          )}
                          {orders.some(order => selectedOrders.has(order.id) && order.status === 'REQUESTED') && (
                            <DropdownMenuItem onClick={handleBulkAcceptRefund} className="text-red-600">
                              Accept All Refund Requests
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-100">
                    <TableCell>
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer accent-gray-900"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleToggleOrder(order.id)}
                      />
                    </TableCell>
                    {visibleColumns.includes('Order ID') && (
                      <TableCell className="text-xs font-mono">{order.orderNumber}</TableCell>
                    )}
                    {visibleColumns.includes('Date') && (
                      <TableCell className="text-sm">{formatOrderDate(order.createdAt)}</TableCell>
                    )}
                    {visibleColumns.includes('Costumer') && (
                      <TableCell className="text-sm">{order.customerName}</TableCell>
                    )}
                    {visibleColumns.includes('Status') && (
                      <TableCell>
                        <span className={`inline-block px-1 text-xs border transition-colors rounded-xs ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </TableCell>
                    )}
                    {visibleColumns.includes('Total') && (
                      <TableCell className="text-sm">{order.total}{order.currency}</TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-gray-200 p-1 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleModifyOrder(order.id)}>
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleModifyAddress(order.id)}>
                            Edit Address
                          </DropdownMenuItem>
                          {order.status === 'CANCELLING' && (
                            <DropdownMenuItem onClick={() => handleAcceptCancel(order.id)} className="text-red-600">
                              Accept Cancel Request
                            </DropdownMenuItem>
                          )}
                          {order.status === 'REQUESTED' && (
                            <DropdownMenuItem onClick={() => handleAcceptRefund(order.id)} className="text-red-600">
                              Accept Refund Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table - Mobile */}
          <div className="lg:hidden border border-gray-300">
            <Table>
              <TableHeader>
                <TableRow className="bg-white hover:bg-white">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-gray-900"
                      checked={allCurrentPageSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someCurrentPageSelected;
                        }
                      }}
                      onChange={handleToggleAll}
                    />
                  </TableHead>
                  {visibleColumns.includes('Status') && (
                    <TableHead
                      className="font-bold cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('Status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortColumn === 'Status' && (
                          sortDirection === 'desc' ? <MoveDown className="w-3 h-3" /> : <MoveUp className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('Date') && (
                    <TableHead
                      className="font-bold cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('Date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortColumn === 'Date' && (
                          sortDirection === 'desc' ? <MoveDown className="w-3 h-3" /> : <MoveUp className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('Costumer') && <TableHead className="font-bold">Costumer</TableHead>}
                  {visibleColumns.includes('Total') && <TableHead className="font-bold">Total</TableHead>}
                  {visibleColumns.includes('Order ID') && <TableHead className="font-bold">Order ID</TableHead>}
                  <TableHead className="w-12">
                    {selectedOrders.size > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-gray-200 p-1 rounded">
                          <EllipsisVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {orders.some(order => selectedOrders.has(order.id) && order.status === 'CANCELLING') && (
                            <DropdownMenuItem onClick={handleBulkAcceptCancel} className="text-red-600">
                              Accept All Cancel Requests
                            </DropdownMenuItem>
                          )}
                          {orders.some(order => selectedOrders.has(order.id) && order.status === 'REQUESTED') && (
                            <DropdownMenuItem onClick={handleBulkAcceptRefund} className="text-red-600">
                              Accept All Refund Requests
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer accent-gray-900"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleToggleOrder(order.id)}
                      />
                    </TableCell>
                    {visibleColumns.includes('Status') && (
                      <TableCell>
                        <span className={`inline-block px-1 text-xs border transition-colors rounded-xs ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </TableCell>
                    )}
                    {visibleColumns.includes('Date') && (
                      <TableCell className="text-sm">{formatOrderDate(order.createdAt)}</TableCell>
                    )}
                    {visibleColumns.includes('Costumer') && (
                      <TableCell className="text-sm">{order.customerName}</TableCell>
                    )}
                    {visibleColumns.includes('Total') && (
                      <TableCell className="text-sm">{order.total}{order.currency}</TableCell>
                    )}
                    {visibleColumns.includes('Order ID') && (
                      <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-gray-200 p-1 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleModifyOrder(order.id)}>
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleModifyAddress(order.id)}>
                            Edit Address
                          </DropdownMenuItem>
                          {order.status === 'CANCELLING' && (
                            <DropdownMenuItem onClick={() => handleAcceptCancel(order.id)} className="text-red-600">
                              Accept Cancel Request
                            </DropdownMenuItem>
                          )}
                          {order.status === 'REQUESTED' && (
                            <DropdownMenuItem onClick={() => handleAcceptRefund(order.id)} className="text-red-600">
                              Accept Refund Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 mt-7 mb-4">
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
        </div>
      </div>
    </div>
  );
}
