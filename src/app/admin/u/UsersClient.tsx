'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/shadcn/dropdown-menu';
import { ChevronLeft, ChevronRight, Plus, Minus, MoreHorizontal, X, MoveDown, MoveUp } from 'lucide-react';
import { formatOrderDate } from '@/lib/formatters';
import { EditUserModal, type UserInfoData } from '@/components/ui/EditUserModal';
import { UserOrdersModal } from '@/components/ui/UserOrdersModal';
import { type OrderTableItem } from '@/components/ui/OrderTable';

const INPUT_STYLE = "w-full max-w-40 sm:max-w-80 lg:max-w-42 text-sm px-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"

interface AddressCondition {
  id: string;
  type: 'line1' | 'line2' | 'city' | 'region' | 'postal' | 'country';
  value: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  lastLogIn: Date;
  lastOrder: Date;
  orderCount: number;
}

interface UsersClientProps {
  initialUsers: User[];
  // Future: server actions will be passed here
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchColumn, setSearchColumn] = useState('E-mail');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Temporary input value before Enter
  const [visibleColumns] = useState(['E-mail', 'Name', 'Last Log In', 'Last Order']);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'Last Log In' | 'Last Order' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [userOrdersModalOpen, setUserOrdersModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserData, setCurrentUserData] = useState<UserInfoData | null>(null);

  // Handle Enter key to trigger search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }
  };

  // Last Log In filter (temporary values before apply)
  const [lastLogInFrom, setLastLogInFrom] = useState('');
  const [lastLogInTo, setLastLogInTo] = useState('');

  // Last Order filter (temporary values before apply)
  const [lastOrderFrom, setLastOrderFrom] = useState('');
  const [lastOrderTo, setLastOrderTo] = useState('');

  // Applied filter values (used for actual filtering)
  const [appliedLastLogInFrom, setAppliedLastLogInFrom] = useState('');
  const [appliedLastLogInTo, setAppliedLastLogInTo] = useState('');
  const [appliedLastOrderFrom, setAppliedLastOrderFrom] = useState('');
  const [appliedLastOrderTo, setAppliedLastOrderTo] = useState('');

  // Address filters (can have multiple) - temporary before apply
  const [addressConditions, setAddressConditions] = useState<AddressCondition[]>([
    { id: '1', type: 'line1', value: '' }
  ]);

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

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedLastLogInFrom(lastLogInFrom);
    setAppliedLastLogInTo(lastLogInTo);
    setAppliedLastOrderFrom(lastOrderFrom);
    setAppliedLastOrderTo(lastOrderTo);

    // Reset to first page when applying filters
    setCurrentPage(1);

    // Close mobile filter panel
    setIsFilterOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    // Clear temporary filter values
    setLastLogInFrom('');
    setLastLogInTo('');
    setLastOrderFrom('');
    setLastOrderTo('');
    setAddressConditions([{ id: '1', type: 'line1', value: '' }]);

    // Clear applied filter values
    setAppliedLastLogInFrom('');
    setAppliedLastLogInTo('');
    setAppliedLastOrderFrom('');
    setAppliedLastOrderTo('');

    // Reset to first page
    setCurrentPage(1);

    // Close mobile filter panel
    setIsFilterOpen(false);
  };

  // Apply advanced filters
  const advancedFilteredUsers = initialUsers.filter(user => {
    // Last Log In filter
    if (appliedLastLogInFrom && new Date(user.lastLogIn) < new Date(appliedLastLogInFrom)) {
      return false;
    }
    if (appliedLastLogInTo && new Date(user.lastLogIn) > new Date(appliedLastLogInTo + 'T23:59:59')) {
      return false;
    }

    // Last Order filter
    if (appliedLastOrderFrom && new Date(user.lastOrder) < new Date(appliedLastOrderFrom)) {
      return false;
    }
    if (appliedLastOrderTo && new Date(user.lastOrder) > new Date(appliedLastOrderTo + 'T23:59:59')) {
      return false;
    }

    return true;
  });

  // Apply search filter
  const searchFilteredUsers = advancedFilteredUsers.filter(user => {
    if (!searchQuery.trim()) {
      return true;
    }

    const query = searchQuery.toLowerCase().trim();

    if (searchColumn === 'E-mail') {
      return user.email.toLowerCase().includes(query);
    } else if (searchColumn === 'Name') {
      return user.name.toLowerCase().includes(query);
    }
    // Order ID search not implemented for mock data
    // Will be implemented when connected to database

    return true;
  });

  // Sort handler
  const handleSort = (column: 'Last Log In' | 'Last Order') => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with default direction
      setSortColumn(column);
      setSortDirection('desc'); // Default to desc (new to old)
    }
  };

  // Sort users
  const sortedUsers = sortColumn ? [...searchFilteredUsers].sort((a, b) => {
    if (sortColumn === 'Last Log In') {
      const dateA = new Date(a.lastLogIn).getTime();
      const dateB = new Date(b.lastLogIn).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    } else {
      // Last Order sorting
      const dateA = new Date(a.lastOrder).getTime();
      const dateB = new Date(b.lastOrder).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    }
  }) : searchFilteredUsers;

  const filteredUsers = sortedUsers;

  // Handler functions for modals
  const handleShowAllOrders = (userId: string) => {
    setCurrentUserId(userId);
    setUserOrdersModalOpen(true);
  };

  const handleEditInformation = (userId: string) => {
    const user = initialUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      setCurrentUserData({
        name: user.name,
        email: user.email,
        birthday: null,
        phone: null,
        addressLine1: '',
        addressLine2: null,
        city: '',
        region: null,
        postalCode: '',
        country: '',
      });
      setEditUserModalOpen(true);
    }
  };

  const handleSaveUserInfo = () => {
    // In real app, this would save to server
    setEditUserModalOpen(false);
  };

  const handleUpdateUserInfo = (updates: Partial<UserInfoData>) => {
    setCurrentUserData(prev => prev ? { ...prev, ...updates } : null);
  };

  // Generate mock orders for a user
  const generateMockOrders = (userId: string): OrderTableItem[] => {
    const user = initialUsers.find(u => u.id === userId);
    if (!user) return [];

    // Generate 15 mock orders for demo
    const statuses: Array<'PENDING' | 'REQUESTED' | 'CANCELLING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'> =
      ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'REQUESTED', 'CANCELLING'];

    return Array.from({ length: 15 }, (_, i) => ({
      id: `${userId}-order-${i + 1}`,
      orderNumber: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      customerName: user.name,
      status: statuses[i % statuses.length],
      total: Math.floor(Math.random() * 500) + 50,
      currency: ['$', '€', 'NT$'][Math.floor(Math.random() * 3)],
    }));
  };

  // Pagination constants
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Calculate paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="lg:grid lg:grid-cols-10 lg:min-h-screen">
        {/* Desktop Filter - 3 columns */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="my-6">
            <h1 className="ml-6 text-4xl font-bold">Users</h1>
          </div>
          <div className="w-full bg-white border-r border-gray-900 py-6 my-8 overflow-x-clip">
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
                {/* Last Log In Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Last Log In</h3>
                  <div className="w-full flex justify-between">
                    <input
                      type="date"
                      placeholder="MM-DD-YYYY"
                      value={lastLogInFrom}
                      onChange={(e) => setLastLogInFrom(e.target.value)}
                      className={INPUT_STYLE}
                    />
                    <span className="flex items-center text-gray-400">-</span>
                    <input
                      type="date"
                      placeholder="MM-DD-YYYY"
                      value={lastLogInTo}
                      onChange={(e) => setLastLogInTo(e.target.value)}
                      className={INPUT_STYLE}
                    />
                  </div>
                </div>

                {/* Last Order Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Last Order</h3>
                  <div className="w-full flex justify-between">
                    <input
                      type="date"
                      placeholder="MM-DD-YYYY"
                      value={lastOrderFrom}
                      onChange={(e) => setLastOrderFrom(e.target.value)}
                      className={INPUT_STYLE}
                    />
                    <span className="flex items-center text-gray-500">-</span>
                    <input
                      type="date"
                      placeholder="MM-DD-YYYY"
                      value={lastOrderTo}
                      onChange={(e) => setLastOrderTo(e.target.value)}
                      className={INPUT_STYLE}
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div>
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

        {/* Main Content - 7 columns */}
        <div className="lg:col-span-7 px-3 lg:p-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex flex-col items-center">
            <h1 className="text-3xl font-bold p-6">Users</h1>
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
                {isFilterOpen && (
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-600 hover:text-gray-900">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Mobile Filter Panel */}
              {isFilterOpen && (
                <div className="items-center w-full flex flex-col">
                  <div className="lg:hidden bg-white overflow-y-auto max-h-[50dvh] w-full">
                    <div className="px-2 py-2">
                      <div className="w-full flex justify-center">
                        <div className="space-y-6 w-full items-center">
                          {/* Last Log In Section */}
                          <div className="flex flex-row justify-between items-center">
                            <span className="text-base font-semibold">Last Log In</span>
                            <div className="flex gap-2 w-64 sm:w-100">
                              <input
                                type="date"
                                placeholder="MM-DD-YYYY"
                                value={lastLogInFrom}
                                onChange={(e) => setLastLogInFrom(e.target.value)}
                                className="w-full text-sm px-0 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
                              />
                              <span className="flex items-center text-gray-400">-</span>
                              <input
                                type="date"
                                placeholder="MM-DD-YYYY"
                                value={lastLogInTo}
                                onChange={(e) => setLastLogInTo(e.target.value)}
                                className="w-full text-sm px-0 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
                              />
                            </div>
                          </div>

                          {/* Last Order Section */}
                          <div className="flex flex-row justify-between items-center">
                            <span className="text-base font-semibold">Last Order</span>
                            <div className="flex gap-2 w-64 sm:w-100">
                              <input
                                type="date"
                                placeholder="MM-DD-YYYY"
                                value={lastOrderFrom}
                                onChange={(e) => setLastOrderFrom(e.target.value)}
                                className="w-full text-sm px-0 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
                              />
                              <span className="flex items-center text-gray-400">-</span>
                              <input
                                type="date"
                                placeholder="MM-DD-YYYY"
                                value={lastOrderTo}
                                onChange={(e) => setLastOrderTo(e.target.value)}
                                className="w-full text-sm px-0 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic"
                              />
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
                      onClick={handleResetFilters}
                      className="w-36 bg-white text-sm text-gray-900 my-4 py-2 px-4 font-semibold border border-gray-700 hover:bg-gray-700 hover:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      RESET
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
            <div className='flex flex-col gap-2 lg:order-1 lg:w-140'>
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
                  <option value="E-mail">E-mail</option>
                  <option value="Name">Name</option>
                  <option value="Order ID">Order ID</option>
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
                    className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-sm">
              {filteredUsers.length > 1 ? `${filteredUsers.length} users` : `${filteredUsers.length} user`}
              <span className="text-gray-500 italic ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            </div>
          </div>

          {/* Table - Desktop */}
          <div className="border border-gray-300">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-100">
                  {visibleColumns.includes('E-mail') && (
                    <TableHead className="font-semibold">E-mail</TableHead>
                  )}
                  {visibleColumns.includes('Name') && (
                    <TableHead className="font-semibold">Name</TableHead>
                  )}
                  {visibleColumns.includes('Last Log In') && (
                    <TableHead
                      className="font-semibold cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('Last Log In')}
                    >
                      <div className="flex items-center gap-2">
                        Last Log In
                        {sortColumn === 'Last Log In' && (
                          sortDirection === 'desc' ? <MoveDown className="w-4 h-4" /> : <MoveUp className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('Last Order') && (
                    <TableHead
                      className="font-semibold cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('Last Order')}
                    >
                      <div className="flex items-center gap-2">
                        Last Order
                        {sortColumn === 'Last Order' && (
                          sortDirection === 'desc' ? <MoveDown className="w-4 h-4" /> : <MoveUp className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-100">
                    {visibleColumns.includes('E-mail') && (
                      <TableCell className="text-sm">{user.email}</TableCell>
                    )}
                    {visibleColumns.includes('Name') && (
                      <TableCell className="text-sm">{user.name}</TableCell>
                    )}
                    {visibleColumns.includes('Last Log In') && (
                      <TableCell className="text-sm">{formatOrderDate(user.lastLogIn)}</TableCell>
                    )}
                    {visibleColumns.includes('Last Order') && (
                      <TableCell className="text-sm">{formatOrderDate(user.lastOrder)}</TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-gray-200 p-1 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleShowAllOrders(user.id)}>
                            Show All Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInformation(user.id)}>
                            Edit Information
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 mt-7">
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

      {/* Modals */}
      <EditUserModal
        isOpen={editUserModalOpen}
        user={currentUserData}
        onClose={() => setEditUserModalOpen(false)}
        onSave={handleSaveUserInfo}
        onUpdateUser={handleUpdateUserInfo}
      />

      <UserOrdersModal
        isOpen={userOrdersModalOpen}
        userName={currentUserId ? (initialUsers.find(u => u.id === currentUserId)?.name || '') : ''}
        orders={currentUserId ? generateMockOrders(currentUserId) : []}
        onClose={() => setUserOrdersModalOpen(false)}
      />
    </div>
  );
}
