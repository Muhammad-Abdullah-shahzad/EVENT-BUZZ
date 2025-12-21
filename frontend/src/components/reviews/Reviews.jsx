import { useState, useEffect, useContext } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { HiStar, HiOutlineStar, HiOutlineChatAlt2 } from 'react-icons/hi';
import AuthContext from '../../context/AuthContext';
import reviewService from '../../services/reviewService';

const StarRating = ({ rating, setRating, editable = false }) => {
    return (
        <div className="d-flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => editable && setRating(star)}
                    style={{ cursor: editable ? 'pointer' : 'default' }}
                >
                    {star <= rating ? (
                        <HiStar className="text-warning" size={24} />
                    ) : (
                        <HiOutlineStar className="text-warning" size={24} />
                    )}
                </span>
            ))}
        </div>
    );
};

const Reviews = ({ eventId }) => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchReviews = async () => {
        try {
            const data = await reviewService.getEventReviews(eventId);
            setReviews(data);
        } catch (err) {
            console.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await reviewService.createReview({ eventId, rating, comment });
            setSuccess('Review submitted!');
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="mt-5 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Reviews & Ratings</h3>
                    <div className="d-flex align-items-center gap-2">
                        <StarRating rating={Math.round(averageRating)} />
                        <span className="fw-bold fs-5">{averageRating}</span>
                        <span className="text-muted">({reviews.length} reviews)</span>
                    </div>
                </div>
                {user && (
                    <Button
                        variant="soft-primary"
                        className="rounded-pill px-4"
                        onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Write a Review
                    </Button>
                )}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {reviews.length === 0 ? (
                        <div className="text-center py-5 bg-white rounded-xl shadow-sm border border-dashed">
                            <HiOutlineChatAlt2 size={50} className="text-muted opacity-25 mb-3" />
                            <h5>No reviews yet</h5>
                            <p className="text-muted">Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {reviews.map((review) => (
                                <Card key={review._id} className="card-custom border-0 shadow-sm animate-fade-in">
                                    <Card.Body className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                                    {review.user?.name ? review.user.name[0].toUpperCase() : 'A'}
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-0">{review.user?.name || 'Anonymous User'}</h6>
                                                    <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 text-warning">
                                                <HiStar />
                                                <span className="fw-bold">{review.rating}</span>
                                            </div>
                                        </div>
                                        <p className="mb-0 text-secondary">{review.comment}</p>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    {user ? (
                        <Card id="review-form" className="card-custom border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Leave Feedback</h5>
                                {error && <Alert variant="danger" className="rounded-xl small">{error}</Alert>}
                                {success && <Alert variant="success" className="rounded-xl small">{success}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4 text-center">
                                        <Form.Label className="small text-muted fw-bold mb-3 d-block">HOW WOULD YOU RATE IT?</Form.Label>
                                        <div className="d-flex justify-content-center">
                                            <StarRating rating={rating} setRating={setRating} editable={true} />
                                        </div>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small text-muted fw-bold">YOUR COMMENT</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder="Write something about the event..."
                                            className="form-control-custom"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Button
                                        type="submit"
                                        className="btn-primary-custom w-100 py-3 rounded-pill fw-bold"
                                        disabled={submitting}
                                    >
                                        {submitting ? <Spinner size="sm" className="me-2" /> : null}
                                        Submit Review
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Card className="card-custom border-0 shadow-sm p-4 text-center bg-light">
                            <h6 className="fw-bold">Sign in to Review</h6>
                            <p className="small text-muted mb-0">Join the conversation and help others discover great events.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
