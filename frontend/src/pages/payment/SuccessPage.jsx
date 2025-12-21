import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import paymentService from '../../services/paymentService';
import Navbar from '../../components/common/Navbar';

const SuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verify = async () => {
            if (bookingId) {
                try {
                    // For local development, we call verification manually since ITN doesn't hit localhost
                    await paymentService.verifyPayment(null, bookingId);
                    setStatus('success');
                    setMessage('Payment successful! Your tickets are ready.');
                } catch (error) {
                    setStatus('error');
                    setMessage('Failed to confirm ticket status.');
                }
                return;
            }

            if (!sessionId) {
                setStatus('error');
                setMessage('No session ID found.');
                return;
            }

            try {
                await paymentService.verifyPayment(sessionId);
                setStatus('success');
                setMessage('Payment successful! Your tickets are ready.');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed.');
            }
        };

        verify();
    }, [sessionId, bookingId]);

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <Container className="py-5 d-flex justify-content-center">
                <Card className="card-custom border-0 shadow-lg text-center p-5" style={{ maxWidth: '500px' }}>
                    {status === 'verifying' && (
                        <>
                            <Spinner animation="border" variant="primary" className="mx-auto mb-4" />
                            <h3 className="fw-bold">Processing Payment</h3>
                            <p className="text-muted">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <HiCheckCircle size={80} className="text-success mx-auto mb-3" />
                            <h2 className="fw-bold text-dark">Payment Confirmed!</h2>
                            <p className="text-muted mb-4">{message}</p>
                            <Button as={Link} to="/user/bookings" className="btn-primary-custom rounded-pill py-3">
                                View My Tickets
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <HiXCircle size={80} className="text-danger mx-auto mb-3" />
                            <h2 className="fw-bold text-dark">Payment Error</h2>
                            <p className="text-muted mb-4">{message}</p>
                            <Button as={Link} to="/" className="btn-primary-custom rounded-pill py-3">
                                Back to Home
                            </Button>
                        </>
                    )}
                </Card>
            </Container>
        </div>
    );
};

export default SuccessPage;
