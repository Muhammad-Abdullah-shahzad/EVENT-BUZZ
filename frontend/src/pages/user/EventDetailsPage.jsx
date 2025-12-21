import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineTicket, HiOutlineUserGroup, HiOutlineArrowLeft, HiOutlineShare } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import eventService from '../../services/eventService';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import AuthContext from '../../context/AuthContext';
import EventMap from '../../components/events/EventMap';
import Reviews from '../../components/reviews/Reviews';

const EventDetailsPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [ticketCount, setTicketCount] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await eventService.getEventById(id);
                setEvent(data);
                setLoading(false);
            } catch (err) {
                setError('Event not found or has been removed');
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        try {
            const booking = await bookingService.createBooking({
                eventId: id,
                tickets: ticketCount
            });

            if (event.ticketPrice > 0) {
                setBookingSuccess('Booking created! Redirecting to checkout...');
                const { paymentUrl, postData } = await paymentService.createCheckoutSession(booking._id);
                paymentService.processPayFastPayment(paymentUrl, postData);
            } else {
                setBookingSuccess('Spot reserved! Redirecting to your tickets...');
                setTimeout(() => navigate('/user/bookings'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></div>
    );

    if (error) return (
        <div className="min-vh-100 bg-light">
            <Navbar />
            <Container className="py-5 text-center">
                <Alert variant="danger" className="d-inner-block">{error}</Alert>
                <Button as={Link} to="/" variant="primary" className="rounded-pill px-4 mt-3">Back to Search</Button>
            </Container>
        </div>
    );

    const imageUrl = event.image?.startsWith('http')
        ? event.image
        : event.image?.startsWith('/uploads')
            ? `http://localhost:5000${event.image}`
            : `https://source.unsplash.com/1600x900/?${event.category}`;

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />

            {/* Header / Banner */}
            <div className="position-relative" style={{ height: '450px' }}>
                <img
                    src={imageUrl}
                    className="w-100 h-100 object-fit-cover"
                    alt={event.title}
                />
                <div className="position-absolute bottom-0 start-0 w-100 p-5 bg-gradient-to-t from-dark to-transparent text-white">
                    <Container>
                        <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">{event.category.toUpperCase()}</Badge>
                        <h1 className="display-4 fw-bold mb-2">{event.title}</h1>
                        <div className="d-flex gap-4 opacity-75">
                            <span className="d-flex align-items-center gap-2"><HiOutlineCalendar /> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="d-flex align-items-center gap-2"><HiOutlineLocationMarker /> {event.venue}</span>
                        </div>
                    </Container>
                </div>
                <div className="position-absolute top-0 start-0 m-4">
                    <Button as={Link} to="/" variant="light" className="rounded-circle shadow p-2 border-0">
                        <HiOutlineArrowLeft size={24} />
                    </Button>
                </div>
            </div>

            <Container className="mt-n5 position-relative z-index-1">
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="card-custom border-0 p-4 mb-4 shadow-sm">
                            <Card.Body>
                                <h4 className="fw-bold mb-4">About Event</h4>
                                <div className="text-muted mb-5" style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                    {event.description}
                                </div>

                                <h4 className="fw-bold mb-4">Location</h4>
                                <div className="rounded-xl overflow-hidden border mb-4 shadow-sm" style={{ height: '350px' }}>
                                    <EventMap
                                        events={[event]}
                                        center={event.location?.coordinates ? [event.location.coordinates[1], event.location.coordinates[0]] : [31.5204, 74.3587]}
                                        zoom={15}
                                    />
                                </div>
                                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-xl">
                                    <div className="bg-white p-2 rounded shadow-sm">
                                        <HiOutlineLocationMarker className="text-danger" size={24} />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Venue Address</h6>
                                        <p className="text-muted small mb-0">{event.address}</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        <Reviews eventId={id} />
                    </Col>

                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: '100px' }}>
                            <Card className="card-custom border-0 p-4 shadow-lg">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="fw-bold text-gradient mb-0">
                                            {event.ticketPrice > 0 ? `Rs. ${event.ticketPrice.toFixed(2)}` : 'FREE'}
                                        </h2>
                                        <Button variant="light" className="rounded-circle p-2">
                                            <HiOutlineShare size={20} />
                                        </Button>
                                    </div>

                                    {bookingSuccess ? (
                                        <Alert variant="success" className="rounded-xl animate-fade-in">
                                            {bookingSuccess}
                                        </Alert>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-light rounded-xl mb-4">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted small">Available Tickets</span>
                                                    <span className="small fw-bold">{event.capacity - event.ticketsSold} left</span>
                                                </div>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div
                                                        className="progress-bar bg-primary"
                                                        style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="small fw-bold text-muted">SELECT TICKETS</Form.Label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Button
                                                        variant="light"
                                                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                                                        className="rounded-circle border"
                                                        style={{ width: '40px', height: '40px' }}
                                                    >-</Button>
                                                    <Form.Control
                                                        className="text-center fw-bold border-0 bg-light"
                                                        value={ticketCount}
                                                        readOnly
                                                    />
                                                    <Button
                                                        variant="light"
                                                        onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                                                        className="rounded-circle border"
                                                        style={{ width: '40px', height: '40px' }}
                                                    >+</Button>
                                                </div>
                                            </Form.Group>

                                            <Button
                                                className="btn-primary-custom w-100 py-3 rounded-pill fw-bold"
                                                onClick={handleBooking}
                                                disabled={bookingLoading || (event.ticketsSold >= event.capacity)}
                                            >
                                                {bookingLoading ? <Spinner size="sm" /> :
                                                    (event.ticketsSold >= event.capacity) ? 'Sold Out' : 'Reserve Spot'}
                                            </Button>
                                        </>
                                    )}

                                    <hr className="my-4" />

                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <HiOutlineUserGroup className="text-muted" />
                                            <span className="small text-muted">Hosted by <strong>{event.user?.name || 'Organizer'}</strong></span>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <HiOutlineTicket className="text-muted" />
                                            <span className="small text-muted">Digital tickets delivered instantly</span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventDetailsPage;
