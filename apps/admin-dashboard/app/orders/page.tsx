'use client';

import { useState } from 'react';
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
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
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
                    <TableCell>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
