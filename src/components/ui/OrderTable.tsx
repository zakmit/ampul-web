'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/shadcn/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { formatOrderDate } from '@/lib/formatters';

export type OrderStatus = 'PENDING' | 'REQUESTED' | 'CANCELLING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderTableItem {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  status: OrderStatus;
  total: number;
  currency: string;
}

interface OrderTableProps {
  orders: OrderTableItem[];
  visibleColumns?: string[];
  onModifyOrder?: (orderId: string) => void;
  onModifyAddress?: (orderId: string) => void;
  onAcceptCancel?: (orderId: string) => void;
  onAcceptRefund?: (orderId: string) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

const statusColors: Record<OrderStatus, string> = {
    PENDING: 'border-blue-500 text-blue-900 bg-blue-200 hover:bg-blue-600 hover:text-blue-100',
    SHIPPED: 'border-olive-600 text-olive-900 bg-olive-200 hover:bg-olive-600 hover:text-olive-100',
    DELIVERED: 'border-gray-600 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-gray-100',
    CANCELLING: 'border-red-600 text-red-900 bg-red-200 hover:bg-red-600 hover:text-red-100',
    CANCELLED: 'border-gray-600 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-gray-100',
    REQUESTED: 'border-yellow-500 text-yellow-900 bg-yellow-200 hover:bg-yellow-500 hover:text-yellow-100',
    REFUNDED: 'border-gray-600 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-gray-100',
};

export function OrderTable({
  orders,
  visibleColumns = ['Order ID', 'Date', 'Costumer', 'Status', 'Total'],
  onModifyOrder,
  onModifyAddress,
  onAcceptCancel,
  onAcceptRefund,
  showActions = true,
  emptyMessage = 'No orders found',
}: OrderTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block border border-gray-300">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-100">
              {visibleColumns.includes('Order ID') && (
                <TableHead className="font-semibold">Order ID</TableHead>
              )}
              {visibleColumns.includes('Date') && (
                <TableHead className="font-semibold">Date</TableHead>
              )}
              {visibleColumns.includes('Costumer') && (
                <TableHead className="font-semibold">Costumer</TableHead>
              )}
              {visibleColumns.includes('Status') && (
                <TableHead className="font-semibold">Status</TableHead>
              )}
              {visibleColumns.includes('Total') && (
                <TableHead className="font-semibold">Total</TableHead>
              )}
              {showActions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (showActions ? 1 : 0)} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-100">
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
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-gray-200 p-1 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {onModifyOrder && (
                            <DropdownMenuItem onClick={() => onModifyOrder(order.id)}>
                              Edit Order
                            </DropdownMenuItem>
                          )}
                          {onModifyAddress && (
                            <DropdownMenuItem onClick={() => onModifyAddress(order.id)}>
                              Edit Address
                            </DropdownMenuItem>
                          )}
                          {order.status === 'CANCELLING' && onAcceptCancel && (
                            <DropdownMenuItem onClick={() => onAcceptCancel(order.id)} className="text-red-600">
                              Accept Cancel Request
                            </DropdownMenuItem>
                          )}
                          {order.status === 'REQUESTED' && onAcceptRefund && (
                            <DropdownMenuItem onClick={() => onAcceptRefund(order.id)} className="text-red-600">
                              Accept Refund Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Table */}
      <div className="lg:hidden border border-gray-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-white hover:bg-white">
              {visibleColumns.includes('Status') && (
                <TableHead className="font-bold">Status</TableHead>
              )}
              {visibleColumns.includes('Date') && (
                <TableHead className="font-bold">Date</TableHead>
              )}
              {visibleColumns.includes('Costumer') && (
                <TableHead className="font-bold">Costumer</TableHead>
              )}
              {visibleColumns.includes('Total') && (
                <TableHead className="font-bold">Total</TableHead>
              )}
              {visibleColumns.includes('Order ID') && (
                <TableHead className="font-bold">Order ID</TableHead>
              )}
              {showActions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (showActions ? 1 : 0)} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
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
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-gray-200 p-1 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {onModifyOrder && (
                            <DropdownMenuItem onClick={() => onModifyOrder(order.id)}>
                              Edit Order
                            </DropdownMenuItem>
                          )}
                          {onModifyAddress && (
                            <DropdownMenuItem onClick={() => onModifyAddress(order.id)}>
                              Edit Address
                            </DropdownMenuItem>
                          )}
                          {order.status === 'CANCELLING' && onAcceptCancel && (
                            <DropdownMenuItem onClick={() => onAcceptCancel(order.id)} className="text-red-600">
                              Accept Cancel Request
                            </DropdownMenuItem>
                          )}
                          {order.status === 'REQUESTED' && onAcceptRefund && (
                            <DropdownMenuItem onClick={() => onAcceptRefund(order.id)} className="text-red-600">
                              Accept Refund Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
