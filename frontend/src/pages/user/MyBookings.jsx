import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { HiOutlineTicket, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineQrcode, HiOutlineCreditCard, HiOutlineExternalLink } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load bookings');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setLoading(true);
        try {
            await bookingService.cancelBooking(bookingId);
            await fetchBookings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel booking');
            setLoading(false);
        }
    };

    const handleShareTicket = async () => {
        if (!selectedBooking?.qrCode) return;

        try {
            if (selectedBooking.qrCode.startsWith('data:image/')) {
                const response = await fetch(selectedBooking.qrCode);
                const blob = await response.blob();
                const file = new File([blob], `ticket-${selectedBooking._id}.png`, { type: blob.type });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `${selectedBooking.event?.title} Ticket`,
                        text: `Here is my ticket for ${selectedBooking.event?.title}.`,
                        files: [file]
                    });
                    return;
                }
            }

            // Fallback to downloading if file sharing is not supported
            const a = document.createElement('a');
            a.href = selectedBooking.qrCode;
            a.download = `ticket-${selectedBooking._id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (err) {
            console.error('Share error:', err);
            if (err.name !== 'AbortError') {
                const a = document.createElement('a');
                a.href = selectedBooking.qrCode;
                a.download = `ticket-${selectedBooking._id}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
    };

    const handlePayClick = (booking) => {
        setSelectedBooking(booking);
        setShowPayModal(true);
    };

    const handleViewTicket = (booking) => {
        navigate(`/ticket/${booking._id}`);
    };

    const confirmPayment = async () => {
        if (!selectedBooking) return;
        setProcessingPayment(true);
        try {
            const { paymentUrl, postData } = await paymentService.createCheckoutSession(selectedBooking._id);
            paymentService.processPayFastPayment(paymentUrl, postData);
        } catch (err) {
            setProcessingPayment(false);
            alert(err.response?.data?.message || 'Payment failed');
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <Container className="py-5 animate-fade-in">
                <div className="mb-5">
                    <h1 className="fw-bold text-dark mb-1">My Tickets</h1>
                    <p className="text-muted">Manage your bookings and digital tickets</p>
                </div>

                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    <Row xs={1} lg={2} className="g-4">
                        {bookings.map((booking) => (
                            <Col key={booking._id}>
                                <Card className="card-custom border-0 overflow-hidden h-100">
                                    <Row className="g-0 h-100">
                                        <Col sm={4} className="position-relative">
                                            <Card.Img
                                                src={booking.event?.image || 'https://via.placeholder.com/300x400'}
                                                className="h-100 object-fit-cover"
                                            />
                                            <div className="position-absolute top-0 start-0 m-2">
                                                <Badge bg={booking.paymentStatus === 'Completed' ? 'success' : 'warning'} className="rounded-pill shadow-sm">
                                                    {booking.paymentStatus}
                                                </Badge>
                                            </div>
                                        </Col>
                                        <Col sm={8}>
                                            <Card.Body className="p-4 d-flex flex-column h-100">
                                                <h5 className="fw-bold text-dark mb-2 text-truncate">{booking.event?.title}</h5>

                                                <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                                                    <HiOutlineCalendar className="text-primary" />
                                                    <span>{new Date(booking.event?.date).toLocaleDateString()}</span>
                                                </div>

                                                <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                                                    <HiOutlineLocationMarker className="text-danger" />
                                                    <span className="text-truncate">{booking.event?.venue}</span>
                                                </div>

                                                <div className="bg-light p-2 rounded-3 mb-4 mt-auto">
                                                    <div className="d-flex justify-content-between small px-2">
                                                        <span className="text-muted">Tickets: <strong>{booking.tickets}</strong></span>
                                                        <span className="text-muted">Total: <strong>Rs. {booking.totalAmount}</strong></span>
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2">
                                                <div className="d-flex w-100 gap-2">
                                                    {booking.paymentStatus === 'Pending' ? (
                                                        <>
                                                            <Button
                                                                className="btn-primary-custom flex-grow-1 rounded-pill py-2"
                                                                onClick={() => handlePayClick(booking)}
                                                            >
                                                                <HiOutlineCreditCard className="me-2" /> Pay
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                className="rounded-pill py-2"
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    ) : booking.paymentStatus !== 'Cancelled' ? (
                                                        <>
                                                            <Button
                                                                variant="dark"
                                                                className="flex-grow-1 rounded-pill py-2"
                                                                onClick={() => handleViewTicket(booking)}
                                                            >
                                                                <HiOutlineQrcode className="me-2" /> Ticket
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                className="rounded-pill py-2"
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button variant="secondary" className="w-100 rounded-pill py-2" disabled>
                                                            Cancelled
                                                        </Button>
                                                    )}
                                                </div>
                                                </div>
                                            </Card.Body>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                        {bookings.length === 0 && (
                            <Col xs={12}>
                                <div className="text-center py-5 bg-white rounded-xl shadow-sm border border-dashed">
                                    <HiOutlineTicket size={60} className="text-muted opacity-25 mb-3" />
                                    <h3 className="fw-bold">No Bookings Yet</h3>
                                    <p className="text-muted">Exploration is just a click away! Find an amazing event to join.</p>
                                    <Button as={Button} onClick={() => window.location.href = '/'} className="btn-primary-custom px-4 rounded-pill">
                                        Explore Events
                                    </Button>
                                </div>
                            </Col>
                        )}
                    </Row>
                )}



                {/* Confirm Payment Modal */}
                <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">Complete Payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="py-4">
                        <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-xl">
                            <div className="bg-white p-2 rounded shadow-sm me-3">
                                <HiOutlineCreditCard size={24} className="text-primary" />
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold">Order Summary</h6>
                                <p className="small text-muted mb-0">{selectedBooking?.event?.title}</p>
                            </div>
                            <div className="ms-auto">
                                <h5 className="mb-0 fw-bold text-gradient">Rs. {selectedBooking?.totalAmount}</h5>
                            </div>
                        </div>
                        <p className="small text-muted mb-0">By clicking confirm, you agree to our terms of service.</p>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                        <Button variant="light" className="w-100 rounded-pill py-2" onClick={() => setShowPayModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="btn-primary-custom w-100 rounded-pill py-2"
                            onClick={confirmPayment}
                            disabled={processingPayment}
                        >
                            {processingPayment ? <Spinner size="sm" /> : 'Confirm Payment'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default MyBookings;
