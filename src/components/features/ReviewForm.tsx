'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface ReviewFormProps {
 productId: string;
 orderId: string;
 onSubmit: (data: { rating: number; content: string }) => Promise<void>;
}

export default function ReviewForm({ productId, orderId, onSubmit }: ReviewFormProps) {
 const [rating, setRating] = useState(0);
 const [content, setContent] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (rating === 0) {
 setError('Please select a rating');
 return;
 }
 setSubmitting(true);
 setError(null);

 try {
 await onSubmit({ rating, content });
 setSubmitted(true);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to submit review');
 } finally {
 setSubmitting(false);
 }
 };

 if (submitted) {
 return (
 <div className="rounded-[90px] border border-green-200 bg-green-50 p-4 text-center">
 <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="mt-2 text-sm font-medium text-green-800">
 Review submitted! Thank you for your feedback.
 </p>
 </div>
 );
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-coral-crimson mb-1.5">
 Your Rating
 </label>
 <StarRating value={rating} onChange={setRating} size="lg" />
 {rating === 0 && error && (
 <p className="mt-1 text-sm text-red-600">{error}</p>
 )}
 </div>

 <div>
 <label
 htmlFor="review-content"
 className="block text-sm font-medium text-coral-crimson mb-1"
 >
 Your Review (optional)
 </label>
 <textarea
 id="review-content"
 value={content}
 onChange={(e) => setContent(e.target.value)}
 placeholder="Share your experience with this dessert..."
 rows={3}
 maxLength={500}
 className="w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors resize-none"
 />
 <p className="mt-1 text-xs text-coral-crimson/50 text-right">
 {content.length}/500
 </p>
 </div>

 {error && !rating && (
 <p className="text-sm text-red-600">{error}</p>
 )}

 <Button
 type="submit"
 loading={submitting}
 disabled={rating === 0}
 className="w-full"
 >
 Submit Review
 </Button>
 </form>
 );
}
