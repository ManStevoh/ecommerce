'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@nexora/ui';
import { createReview, fetchReviews, type ReviewsResponse } from '@/lib/api';
import { getAccessToken, getStoredUser } from '@/lib/auth';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export function ProductReviews({
  productId,
  initial,
}: {
  productId: string;
  initial: ReviewsResponse;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviews(productId, TENANT_ID),
    initialData: initial,
  });
  const [rating, setRating] = useState('5');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = getStoredUser();
  const reviews = data?.reviews ?? [];
  const avg = data?.averageRating ?? 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createReview(TENANT_ID, {
        productId,
        rating: parseInt(rating, 10),
        customerName:
          name ||
          `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
          'Customer',
        customerEmail: email || user?.email || '',
        title: title || undefined,
        comment: comment || undefined,
        userId: user?.id,
      });
      setTitle('');
      setComment('');
      await queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">Reviews</h2>
      <p className="mb-6 text-zinc-500">
        {avg > 0 ? `${avg} / 5` : 'No reviews yet'} ({data?.count ?? 0})
      </p>

      {reviews.length > 0 && (
        <div className="mb-8 space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="glass-card">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.customerName}</span>
                  <span className="text-amber-600">{'★'.repeat(r.rating)}</span>
                </div>
                {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                {r.comment && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {r.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Write a review</CardTitle>
          <CardDescription>
            Share your experience with this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!getAccessToken() ? (
            <p className="text-sm text-zinc-500">
              <button
                type="button"
                className="text-amber-600 hover:underline"
                onClick={() => router.push('/login')}
              >
                Sign in
              </button>{' '}
              to leave a review, or fill in your details below.
            </p>
          ) : null}
          <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="review-rating">Rating</Label>
              <Input
                id="review-rating"
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="1–5"
              />
            </div>
            {!user && (
              <>
                <div>
                  <Label htmlFor="review-name">Name</Label>
                  <Input
                    id="review-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="review-email">Email</Label>
                  <Input
                    id="review-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="review-title">Title</Label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional headline"
              />
            </div>
            <div>
              <Label htmlFor="review-comment">Comment</Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others what you think"
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="luxury" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
