import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';

const FakeStripeCheckout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const bookingId = searchParams.get('booking_id');
    const amount = searchParams.get('amount') || '0.00';
    const eventName = searchParams.get('event_name') || 'Event Ticket';

    const handlePayment = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate network request
        setTimeout(() => {
            navigate(`/payment/success?booking_id=${bookingId}`);
        }, 1500);
    };

    if (!bookingId) {
        return (
            <Container className="py-5 text-center">
                <h2>Invalid Checkout Session</h2>
            </Container>
        );
    }

    return (
        <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
            <Container>
                <Card className="border-0 shadow-lg mx-auto" style={{ maxWidth: '500px', borderRadius: '15px' }}>
                    <Card.Header className="bg-white border-0 text-center pt-4 pb-0">
                        <div className="d-flex justify-content-center align-items-center mb-3">
                            <span className="bg-primary text-white p-2 rounded-circle fw-bold me-2" style={{ fontSize: '1.2rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</span>
                            <span className="fs-5 fw-bold text-dark">Stripe (Test Mode)</span>
                        </div>
                        <h4 className="text-muted mb-0">{eventName}</h4>
                        <h2 className="fw-bold fs-1 mt-2 mb-4">Rs. {amount}</h2>
                    </Card.Header>
                    <Card.Body className="p-4">
                        <div className="bg-light p-3 rounded mb-4" style={{ border: '1px dashed #ccc' }}>
                            <small className="text-muted d-block text-center mb-2">Test Card Numbers</small>
                            <div className="d-flex justify-content-between mb-1">
                                <span className="small text-dark">Success</span>
                                <span className="small fw-bold">4242 4242 4242 4242</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="small text-dark">Any valid future date / CVC</span>
                                <span className="small fw-bold">12/30 • 123</span>
                            </div>
                        </div>

                        <Form onSubmit={handlePayment}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted fw-bold">Card Information</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="4242 4242 4242 4242" 
                                    defaultValue="4242 4242 4242 4242"
                                    required 
                                    className="py-2 mb-2"
                                />
                                <div className="d-flex gap-2">
                                    <Form.Control type="text" placeholder="MM / YY" defaultValue="12/30" required className="py-2" />
                                    <Form.Control type="text" placeholder="CVC" defaultValue="123" required className="py-2" />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small text-muted fw-bold">Name on card</Form.Label>
                                <Form.Control type="text" placeholder="John Doe" required className="py-2" />
                            </Form.Group>

                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-100 py-3 fw-bold rounded" 
                                disabled={loading}
                                style={{ backgroundColor: '#635bff', borderColor: '#635bff' }}
                            >
                                {loading ? <Spinner size="sm" animation="border" /> : `Pay Rs. ${amount}`}
                            </Button>
                        </Form>
                        <div className="text-center mt-3">
                            <Button variant="link" className="text-muted text-decoration-none small" onClick={() => navigate(`/payment/cancel?booking_id=${bookingId}`)}>
                                Cancel and return to EventBuzz
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default FakeStripeCheckout;
