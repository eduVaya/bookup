import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@/lib/services/reviews.service';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import { getErrors } from '@/lib/services/handleError';
import { toast } from 'sonner';
import type { Book } from '@/types';

interface CompletedBookProps {
  book: Book;
  clubId: number;
  isMember: boolean;
  isAdmin: boolean;
  onReview: (book: { id: number; title: string; existingReview?: { id: number; rating: number; content: string | null } }) => void;
  onDelete: (bookId: number) => void;
  isDeleting: boolean;
}

function CompletedBook({ book, clubId, isMember, isAdmin, onReview, onDelete, isDeleting }: CompletedBookProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const { data: reviews } = useQuery({
    queryKey: ['bookReviews', book.id],
    queryFn: () => reviewsService.getBookReviews(clubId, book.id),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsService.deleteReview(clubId, book.id, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookReviews', book.id] });
      setReviewToDelete(null);
      toast.success('Review deleted');
    },
    onError: (error) => {
      toast.error(getErrors(error)[0]);
    }
  });

  const myReview = reviews?.find(r => r.user.name === user?.name);
  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <div
        className="py-3"
        style={{ borderBottom: '0.5px solid var(--bk-border)' }}
      >
        <div className="flex items-center gap-3">
          {book.coverUrl && (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-[36px] h-[52px] rounded object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <p
              className="text-[13px] font-medium"
              style={{ color: 'var(--bk-text-primary)' }}
            >
              {book.title}
            </p>
            <p
              className="text-[11px]"
              style={{ color: 'var(--bk-text-muted)' }}
            >
              {book.author}
            </p>
            {avgRating && (
              <p className="text-[11px]" style={{ color: 'var(--bk-accent)' }}>
                ⭐ {avgRating} · {reviews?.length} reviews
              </p>
            )}
          </div>

          <div className="flex gap-1">
            {isMember && !myReview && (
              <button
                onClick={() => onReview({ id: book.id, title: book.title })}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                style={{ border: '1px solid var(--bk-accent)', color: 'var(--bk-accent)' }}
              >
                Review
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onDelete(book.id)}
                disabled={isDeleting}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                style={{ border: '1px solid #C4A89A', color: '#8B5E52' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-3 rounded-lg"
                style={{ background: 'var(--bk-bg)', border: '1px solid var(--bk-border)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium" style={{ color: 'var(--bk-text-primary)' }}>
                      {review.user.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--bk-accent)' }}>
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </div>
                  {review.user.name === user?.name && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onReview({
                          id: book.id,
                          title: book.title,
                          existingReview: {
                            id: review.id,
                            rating: review.rating,
                            content: review.content
                          }
                        })}
                        className="text-[10px] px-2 py-1 rounded"
                        style={{ color: 'var(--bk-text-muted)' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setReviewToDelete(review.id)}
                        className="text-[10px] px-2 py-1 rounded"
                        style={{ color: '#8B5E52' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                {review.content && (
                  <p className="text-[12px]" style={{ color: 'var(--bk-text-secondary)' }}>
                    {review.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={reviewToDelete !== null}
        onClose={() => setReviewToDelete(null)}
        onConfirm={() => reviewToDelete && deleteReviewMutation.mutate(reviewToDelete)}
        title="Delete review"
        description="Are you sure you want to delete your review?"
        isLoading={deleteReviewMutation.isPending}
      />
    </>
  );
}

export default CompletedBook;