'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { getReviews, subscribeToReviews, submitReview, getUserReview } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StarRating, { RatingBar } from '@/components/ui/StarRating';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function ReviewsSection({ episodeId, ratingAvg = 0, reviewCount = 0, onRatingUpdate }) {
  const { user, isAuthenticated, isGuest } = useAuth();

  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState('');
  const [myExisting, setMyExisting] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const data = await getReviews(episodeId);
    setReviews(data);
    if (isAuthenticated && user && !isGuest) {
      const existing = await getUserReview(episodeId, user.id);
      if (existing) {
        setMyExisting(existing);
        setMyRating(existing.rating);
        setMyComment(existing.comment || '');
      }
    }
    setLoading(false);
  }, [episodeId, isAuthenticated, user, isGuest]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    const unsubscribe = subscribeToReviews(episodeId, (newReview) => {
      setReviews((prev) => {
        if (prev.find((r) => r.id === newReview.id)) return prev;
        return [newReview, ...prev];
      });
    });
    return unsubscribe;
  }, [episodeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || isGuest) return;
    if (myRating === 0) { setError('Please select a star rating.'); return; }

    setSubmitting(true);
    setError('');

    const result = await submitReview(episodeId, user.id, myRating, myComment);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to submit review.');
      return;
    }

    setSuccess(true);
    setMyExisting(result.data);

    if (result.mock) {
      setReviews((prev) => [result.data, ...prev.filter((r) => r.user_id !== user.id)]);
    }

    const total = reviews.reduce((sum, r) => sum + r.rating, 0) + myRating;
    const count = reviews.length + (myExisting ? 0 : 1);
    onRatingUpdate?.(total / count, count);

    setTimeout(() => setSuccess(false), 3000);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0)  return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            Community Reviews
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            <MessageCircle size={13} style={{ display: 'inline', marginRight: 4 }} />
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        <div style={{ minWidth: 200 }}>
          <RatingBar rating={ratingAvg} reviewCount={reviewCount} />
        </div>
      </div>

      {isAuthenticated && !isGuest ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 28,
            backdropFilter: 'blur(20px)',
          }}
        >
          <h3 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.9rem', fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 16,
          }}>
            {myExisting ? '✏️ Update Your Review' : '⭐ Write a Review'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
                Your Rating
              </p>
              <StarRating value={myRating} onChange={setMyRating} size={28} showLabel color="#FFB800" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <textarea
                className="af-input"
                placeholder="Share your thoughts about this episode..."
                value={myComment}
                onChange={(e) => { setMyComment(e.target.value); setError(''); }}
                rows={3}
                style={{ resize: 'vertical', minHeight: 80, fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 10, marginBottom: 12,
                    background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                    color: '#ff4444', fontSize: '0.82rem',
                  }}
                >
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{
                    padding: '10px 14px', borderRadius: 10, marginBottom: 12,
                    background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                    color: '#4ade80', fontSize: '0.82rem', fontWeight: 600,
                  }}
                >
                  ✅ Review submitted successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatedButton
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting || myRating === 0}
              icon={submitting
                ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                : <Send size={14} />
              }
            >
              {submitting ? 'Submitting...' : myExisting ? 'Update Review' : 'Submit Review'}
            </AnimatedButton>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            padding: '20px 24px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 16,
            marginBottom: 28,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 12 }}>
            Sign in to leave a review and rating.
          </p>
          <AnimatedButton variant="primary" size="sm" icon={<LogIn size={14} />}
            onClick={() => window.location.href = '/login'}
          >
            Sign In to Review
          </AnimatedButton>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 size={32} color="#FF6B00" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
          <MessageCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimatePresence initial={false}>
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF6B00 0%, #FFB800 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0,
                    }}>
                      {(review.profiles?.username || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', margin: 0 }}>
                        {review.profiles?.username || 'Anonymous'}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: '2px 0 0' }}>
                        {timeAgo(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <StarRating value={review.rating} size={14} readOnly />
                </div>

                {review.comment && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {review.comment}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
