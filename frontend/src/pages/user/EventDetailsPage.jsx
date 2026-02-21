import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineTicket, HiOutlineUserGroup, HiOutlineArrowLeft, HiOutlineShare } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import eventService from '../../services/eventService';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import AuthContext from '../../context/AuthContext';
import LanguageContext from '../../context/LanguageContext';
import EventMap from '../../components/events/EventMap';
import Reviews from '../../components/reviews/Reviews';
import CountdownTimer from '../../components/events/CountdownTimer';

const EventDetailsPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { t, language } = useContext(LanguageContext);
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
                setError(t('event_not_found') || 'Event not found or has been removed');
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, t]);

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
                setBookingSuccess(language === 'ur' ? 'بکنگ مکمل! پیمنٹ کی طرف منتقل کیا جا رہا ہے...' : 'Booking created! Redirecting to checkout...');
                const { paymentUrl, postData } = await paymentService.createCheckoutSession(booking._id);
                paymentService.processPayFastPayment(paymentUrl, postData);
            } else {
                setBookingSuccess(t('bookingSuccess'));
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
                <Alert variant="danger" className="d-inline-block">{error}</Alert>
                <div className="mt-3">
                    <Button as={Link} to="/" variant="primary" className="rounded-pill px-4">
                        {language === 'ur' ? 'تلاش کی طرف واپس' : 'Back to Search'}
                    </Button>
                </div>
            </Container>
        </div>
    );

    const imageUrl = event.image?.startsWith('http')
        ? event.image
        : event.image?.startsWith('/uploads')
            ? `http://localhost:5000${event.image}`
            : `https://source.unsplash.com/1600x900/?${event.category}`;

    const formattedDate = event ? new Date(event.date).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '';

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
                        <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill fs-6">{event.category}</Badge>
                        <h1 className="display-4 fw-bold mb-2 text-start">{event.title}</h1>
                        <div className="d-flex flex-wrap gap-4 align-items-center opacity-90 text-start">
                            <div className="d-flex align-items-center gap-2">
                                <HiOutlineCalendar size={20} className="text-primary" />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <HiOutlineLocationMarker size={20} className="text-danger" />
                                <span>{event.venue}</span>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>

            <Container className="mt-n5 position-relative z-index-1">
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm rounded-xl p-4 mb-4 bg-card">
                            <div className="mb-4 text-start">
                                <h4 className="fw-bold mb-3">{t('about')}</h4>
                                <div className="text-muted lead-sm" style={{ whiteSpace: 'pre-wrap' }}>
                                    {event.description}
                                </div>
                            </div>

                            <div className="mb-4 text-start">
                                <h4 className="fw-bold mb-3">{t('venue')}</h4>
                                <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-lg border">
                                    <HiOutlineLocationMarker size={24} className="text-danger mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="fw-bold mb-1">{event.venue}</p>
                                        <p className="text-muted small mb-0">{event.address}</p>
                                    </div>
                                </div>
                                <div className="event-map-container mt-3 rounded-lg overflow-hidden border" style={{ height: '350px' }}>
                                    <EventMap events={[event]} center={event.location?.coordinates?.length === 2 ? [event.location.coordinates[1], event.location.coordinates[0]] : [31.5204, 74.3587]} zoom={15} />
                                </div>
                            </div>

                            {event.gallery && event.gallery.length > 0 && (
                                <div className="mb-4 text-start">
                                    <h4 className="fw-bold mb-3">{t('gallery')}</h4>
                                    <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                        {event.gallery.map((img, index) => (
                                            <div key={index} className="gallery-item-wrapper rounded-lg overflow-hidden border shadow-sm" style={{ height: '150px' }}>
                                                <img
                                                    src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                                    alt={`Gallery ${index}`}
                                                    className="w-100 h-100 object-fit-cover hover-scale"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 text-start">
                                <h4 className="fw-bold mb-3">{t('reviews')}</h4>
                                <Reviews eventId={id} />
                            </div>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: '100px' }}>
                            <Card className="border-0 shadow-lg rounded-xl overflow-hidden mb-4 bg-card-gradient text-white">
                                <Card.Body className="p-4 text-center">
                                    <h5 className="mb-3 opacity-90">{t('timeLeft')}</h5>
                                    <CountdownTimer targetDate={event.date} />
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm rounded-xl p-4 bg-card text-start">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0">{t('buyTicket')}</h5>
                                    <Button variant="light" className="rounded-circle p-2 shadow-sm border">
                                        <HiOutlineShare size={18} />
                                    </Button>
                                </div>

                                {bookingSuccess ? (
                                    <Alert variant="success" className="rounded-xl animate-fade-in mb-0">
                                        {bookingSuccess}
                                    </Alert>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted small">{t('price')}</span>
                                                <span className="fw-bold text-primary fs-4">
                                                    {event.ticketPrice > 0 ? `Rs. ${event.ticketPrice.toFixed(2)}` : t('free')}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted small">{t('ticketAvailable')}</span>
                                                <span className={`small fw-bold ${event.capacity - event.ticketsSold < 10 ? 'text-danger' : 'text-success'}`}>
                                                    {event.capacity - event.ticketsSold} {t('ticketsLeft')}
                                                </span>
                                            </div>
                                            <div className="progress mt-2" style={{ height: '6px' }}>
                                                <div
                                                    className={`progress-bar ${event.capacity - event.ticketsSold < 10 ? 'bg-danger' : 'bg-primary'}`}
                                                    style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted">{language === 'ur' ? 'ٹکٹ منتخب کریں' : 'SELECT TICKETS'}</Form.Label>
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
                                            className="btn-primary-custom w-100 py-3 rounded-pill fw-bold shadow-sm"
                                            onClick={handleBooking}
                                            disabled={bookingLoading || (event.ticketsSold >= event.capacity)}
                                        >
                                            {bookingLoading ? <Spinner size="sm" className="me-2" /> : null}
                                            {event.ticketsSold >= event.capacity
                                                ? (language === 'ur' ? 'ٹکٹ ختم' : 'Sold Out')
                                                : (event.ticketPrice > 0 ? t('buyTicket') : (language === 'ur' ? 'جگہ بک کریں' : 'Reserve Spot'))}
                                        </Button>

                                        <div className="mt-4 pt-4 border-top">
                                            <div className="d-flex flex-column gap-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <HiOutlineUserGroup className="text-muted" />
                                                    <span className="small text-muted">{language === 'ur' ? 'میزبان:' : 'Hosted by'} <strong>{event.user?.name || 'Organizer'}</strong></span>
                                                </div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <HiOutlineTicket className="text-muted" />
                                                    <span className="small text-muted">{language === 'ur' ? 'ڈیجیٹل ٹکٹ فوری ڈیلیور' : 'Digital tickets delivered instantly'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventDetailsPage;
