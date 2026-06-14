'use client';

import { useState, Fragment } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from '@nexora/ui';
import {
  fetchOrders,
  updateOrderStatus,
  createShipment,
  refundOrder,
  approvePayment,
} from '@/lib/api';

function statusVariant(status: string) {
  const s = status.toLowerCase();
  if (s === 'delivered' || s === 'completed' || s === 'shipped')
    return 'success' as const;
  if (s === 'pending') return 'warning' as const;
  if (s === 'cancelled' || s === 'refunded') return 'secondary' as const;
  return 'secondary' as const;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const [shipOrderId, setShipOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('manual');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const approvePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => approvePayment(paymentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const confirmMutation = useMutation({
    mutationFn: (orderId: string) => updateOrderStatus(orderId, 'CONFIRMED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const shipMutation = useMutation({
    mutationFn: ({
      orderId,
      tracking,
      carrierName,
    }: {
      orderId: string;
      tracking?: string;
      carrierName?: string;
    }) =>
      createShipment(orderId, {
        trackingNumber: tracking || undefined,
        carrier: carrierName || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShipOrderId(null);
      setTrackingNumber('');
    },
  });

  const refundMutation = useMutation({
    mutationFn: (orderId: string) => refundOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => updateOrderStatus(orderId, 'CANCELLED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const noTenant = !process.env.NEXT_PUBLIC_TENANT_ID;

  return (
    <div className="admin-page">
      <PageHeader
        title="Orders"
        description="View, confirm, and ship customer orders"
      />

      {noTenant && (
        <Alert variant="warning" className="mb-6">
          <AlertDescription>
            Set NEXT_PUBLIC_TENANT_ID in .env.local (from db:seed output)
          </AlertDescription>
        </Alert>
      )}

      {shipOrderId && (
        <Card className="mb-6 border-indigo-200 bg-indigo-50/40">
          <CardHeader>
            <CardTitle className="text-base">Create shipment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="DHL, G4S, manual"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tracking">Tracking number (optional)</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="TRK-123456"
                className="mt-1.5"
              />
            </div>
            <Button
              onClick={() =>
                shipMutation.mutate({
                  orderId: shipOrderId,
                  tracking: trackingNumber,
                  carrierName: carrier,
                })
              }
              disabled={shipMutation.isPending}
            >
              {shipMutation.isPending ? 'Shipping…' : 'Mark shipped'}
            </Button>
            <Button variant="ghost" onClick={() => setShipOrderId(null)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Orders</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <TableSkeleton rows={5} />}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load orders. Is the API gateway running?
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && orders?.length === 0 && (
            <p className="text-sm text-zinc-500">
              No orders yet. Place a test order from the storefront checkout.
            </p>
          )}
          {orders && orders.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <Fragment key={order.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-zinc-50/50"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      >
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700">
                            {isExpanded ? "▼" : "▶"} {order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>KES {order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={confirmMutation.isPending}
                                onClick={() => confirmMutation.mutate(order.id)}
                              >
                                Confirm
                              </Button>
                            )}
                            {['pending', 'confirmed', 'processing'].includes(
                              order.status,
                            ) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-zinc-600"
                                disabled={cancelMutation.isPending}
                                onClick={() => {
                                  if (confirm(`Cancel order ${order.orderNumber}?`)) {
                                    cancelMutation.mutate(order.id);
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                            {['pending', 'confirmed', 'processing'].includes(
                              order.status,
                            ) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShipOrderId(order.id)}
                              >
                                Ship
                              </Button>
                            )}
                            {['completed', 'delivered', 'shipped', 'confirmed'].includes(
                              order.status,
                            ) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                disabled={refundMutation.isPending}
                                onClick={() => {
                                  if (confirm(`Refund order ${order.orderNumber}?`)) {
                                    refundMutation.mutate(order.id);
                                  }
                                }}
                              >
                                Refund
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/10">
                          <TableCell colSpan={6} className="p-4 border-t border-zinc-150">
                            <div className="grid gap-6 md:grid-cols-2 text-sm text-zinc-600 dark:text-zinc-400">
                              <div>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Shipping Details</h4>
                                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Order Items</h4>
                                <div className="space-y-1">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between">
                                      <span>{item.name} <span className="text-zinc-400">x{item.quantity}</span></span>
                                      <span>KES {item.totalPrice.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Payment Transactions</h4>
                              {order.payments.length === 0 ? (
                                <p className="text-zinc-500">No payment records found.</p>
                              ) : (
                                <div className="space-y-3">
                                  {order.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between border-b border-zinc-100/50 pb-2 last:border-0">
                                      <div>
                                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                                          {payment.provider.toUpperCase()} (Ref: {payment.providerRef || "None"})
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                          Amount: KES {payment.amount.toLocaleString()} | Status: {payment.status.toUpperCase()}
                                        </p>
                                        {payment.metadata?.bankDetails && (
                                          <div className="mt-1 text-xs text-zinc-500 bg-zinc-100 p-2 rounded dark:bg-zinc-800">
                                            <strong>Bank Details:</strong> Bank: {payment.metadata.bankDetails.bankName} | Acc: {payment.metadata.bankDetails.accountNumber} | Ref: {payment.metadata.bankDetails.reference}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        {payment.status === 'pending' && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                            disabled={approvePaymentMutation.isPending}
                                            onClick={() => approvePaymentMutation.mutate(payment.id)}
                                          >
                                            {approvePaymentMutation.isPending ? "Approving..." : "Approve Payment"}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
