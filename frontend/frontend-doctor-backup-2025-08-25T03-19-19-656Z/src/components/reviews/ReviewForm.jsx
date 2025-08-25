import React, { useState } from 'react';
import { Star as StarIcon as StarIcon as StarIcon } from 'lucide-react'
import { Review, Notification } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
function StarRating({ rating, setRating }) {
    return (
        <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={ratingValue}
                        type="button"
                        onClick={() => setRating(ratingValue)}
                        className="focus:outline-none"
                    >
                        <StarIcon
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                                ratingValue <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export default function ReviewForm({ booking, currentUser, reviewee, onComplete, onClose }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        setIsSubmitting(true);
        try {
            await Review.create({
                booking_id: booking.id,
                reviewer_id: currentUser.id,
                reviewee_id: reviewee.id,
                rating,
                comment,
                reviewer_type: currentUser.user_type === 'owner' ? 'owner' : 'sitter'
            });

            // This is a simplification. A real app would use a backend function to recalculate average rating.
            // For now, we will notify the user they got a review.
            await Notification.create({
                user_id: reviewee.id,
                message: `You've received a new ${rating}-star review from ${currentUser.full_name} for booking #${booking.id.slice(-4)}.`,
                type: 'review_new',
                link_to: `/Profile`
            });

            onComplete();
        } catch (error) {
            console.error("Failed to submit review:", error);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a Review for {reviewee.full_name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div>
                        <p className="text-center font-medium mb-3">Your Rating</p>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div>
                        <p className="text-center font-medium mb-3">Add a Comment</p>
                        <Textarea
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}