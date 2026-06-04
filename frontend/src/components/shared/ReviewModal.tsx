import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { reviewsService } from '@/lib/services/reviews.service';
import { getErrors } from '@/lib/services/handleError';
import { toast } from 'sonner';

interface ReviewModalProps {
    open: boolean;
    onClose: () => void;
    clubId: number;
    bookId: number;
    bookTitle: string;
    existingReview?: { id: number; rating: number; content: string | null };
}

function ReviewModal({ open, onClose, clubId, bookId, bookTitle, existingReview }: ReviewModalProps) {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(existingReview?.rating ?? 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [content, setContent] = useState(existingReview?.content ?? '');
    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setContent(existingReview.content ?? '');
        } else {
            setRating(0);
            setContent('');
        }
    }, [existingReview]);
    const createMutation = useMutation({
        mutationFn: () => reviewsService.createReview(clubId, bookId, {
            rating,
            content: content.trim() || undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookReviews', bookId] });
            toast.success('Review submitted!');
            handleClose();
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const updateMutation = useMutation({
        mutationFn: () => reviewsService.updateReview(clubId, bookId, {
            rating,
            content: content.trim() || undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookReviews', bookId] });
            toast.success('Review updated!');
            handleClose();
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const handleSubmit = () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (existingReview) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const handleClose = () => {
        setRating(0);
        setHoveredRating(0);
        setContent('');
        createMutation.reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            >
                <DialogHeader>
                    <DialogTitle
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                    >
                        Review
                    </DialogTitle>
                    <p
                        className="text-[13px]"
                        style={{ color: 'var(--bk-text-muted)' }}
                    >
                        {bookTitle}
                    </p>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    {/* Star rating */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="text-[28px] transition-transform hover:scale-110"
                                >
                                    {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Your thoughts <span style={{ color: 'var(--bk-text-muted)' }}>(optional)</span>
                        </label>
                        <textarea
                            placeholder="What did you think of this book?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full text-[14px] px-3 py-2 rounded-lg resize-none outline-none"
                            style={{
                                background: 'var(--bk-bg)',
                                border: '1px solid var(--bk-border)',
                                color: 'var(--bk-text-primary)',
                            }}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleClose}
                            style={{ borderColor: 'var(--bk-border)', color: 'var(--bk-text-secondary)' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 font-semibold"
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending || rating === 0}
                            style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                        >
                            {createMutation.isPending || updateMutation.isPending
                                ? 'Submitting...'
                                : existingReview ? 'Update review' : 'Submit review'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ReviewModal;