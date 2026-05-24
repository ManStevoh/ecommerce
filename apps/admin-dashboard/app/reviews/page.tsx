'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  approveReview,
  deleteReview,
  fetchReviews,
} from '@/lib/api/reviews';

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: fetchReviews,
  });

  async function handleApprove(id: string) {
    await approveReview(id);
    await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    await deleteReview(id);
    await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  }

  const pending = reviews?.filter((r) => !r.isApproved) ?? [];

  return (
    <div className="admin-page">
      <PageHeader
        title="Reviews"
        description="Moderate customer product reviews before they appear on the storefront"
      />

      {pending.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardContent className="py-4 text-sm text-amber-900">
            {pending.length} review{pending.length !== 1 ? 's' : ''} awaiting approval
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>All reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : !reviews?.length ? (
            <p className="text-sm text-zinc-500">No reviews yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.product?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div>{review.customerName}</div>
                      <div className="text-xs text-zinc-500">{review.customerEmail}</div>
                    </TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.comment ?? review.title ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.isApproved ? 'success' : 'warning'}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!review.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleApprove(review.id)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => void handleDelete(review.id)}
                        >
                          Delete
                        </Button>
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
