import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUser, HiOutlineTicket, HiOutlineShare, HiOutlineDownload, HiOutlineArrowLeft } from 'react-icons/hi';
import bookingService from '../../services/bookingService';
import html2canvas from 'html2canvas';
import './TicketPage.css';

const TicketPage = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const ticketRef = useRef(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const data = await bookingService.getPublicTicket(id);
                setBooking(data);
                setLoading(false);
            } catch (err) {
                setError('Ticket not found or has been cancelled.');
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        const canvas = await html2canvas(ticketRef.current, {
            backgroundColor: null,
            scale: 2,
            useCORS: true
        });
        const link = document.createElement('a');
        link.download = `ticket-${booking.event.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const [copied, setCopied] = useState(false);

    const ticketUrl = window.location.href;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(ticketUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // fallback for older browsers
            const input = document.createElement('input');
            input.value = ticketUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Ticket for ${booking.event.title}`,
                    text: `Here's my ticket for ${booking.event.title}! 🎟️`,
                    url: ticketUrl,
                });
            } catch (err) {
                if (err.name !== 'AbortError') handleCopyLink();
            }
        } else {
            handleCopyLink();
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-ticket-page">
            <Spinner animation="border" variant="light" />
        </div>
    );

    if (error) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-ticket-page">
            <Container className="text-center">
                <Alert variant="danger" className="glass-morphism border-0 text-white">
                    <h4 className="fw-bold">Oops!</h4>
                    <p>{error}</p>
                    <Link to="/" className="btn btn-light rounded-pill px-4 mt-2">Back to Home</Link>
                </Alert>
            </Container>
        </div>
    );

    const eventDate = new Date(booking.event.date);

    return (
        <div className="bg-ticket-page min-vh-100 py-5 px-3">
            <Container className="d-flex flex-column align-items-center">
                <div className="d-flex justify-content-between w-100 max-width-ticket mb-4">
                    <Link to="/user/bookings" className="btn btn-glass-back rounded-circle p-2 shadow-sm">
                        <HiOutlineArrowLeft size={24} />
                    </Link>
                    <div className="d-flex gap-2">
                        <Button variant="light" className="rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" onClick={handleShare}>
                            <HiOutlineShare /> Share
                        </Button>
                        <Button variant="dark" className="rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" onClick={handleDownload}>
                            <HiOutlineDownload /> Download
                        </Button>
                    </div>
                </div>

                <div className="ticket-container animate-slide-up" ref={ticketRef}>
                    {/* Top Section with Image */}
                    <div className="ticket-header">
                        <img src={booking.event.image} alt={booking.event.title} className="ticket-img" />
                        <div className="ticket-overlay">
                            <div className="badge-status">{booking.paymentStatus}</div>
                        </div>
                    </div>

                    {/* Middle Section with Info */}
                    <div className="ticket-body">
                        <div className="ticket-perforation-left"></div>
                        <div className="ticket-perforation-right"></div>
                        
                        <div className="ticket-content">
                            <h2 className="event-title">{booking.event.title}</h2>
                            <div className="info-grid">
                                <div className="info-item">
                                    <HiOutlineCalendar className="icon" />
                                    <div>
                                        <span className="label">DATE & TIME</span>
                                        <span className="value">{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span className="value-small">{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <HiOutlineLocationMarker className="icon" />
                                    <div>
                                        <span className="label">LOCATION</span>
                                        <span className="value">{booking.event.venue}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <HiOutlineUser className="icon" />
                                    <div>
                                        <span className="label">ATTENDEE</span>
                                        <span className="value">{booking.user.name}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <HiOutlineTicket className="icon" />
                                    <div>
                                        <span className="label">TICKETS</span>
                                        <span className="value">{booking.tickets} Person(s)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section with QR */}
                    <div className="ticket-footer">
                        <div className="qr-wrapper">
                            <img src={booking.qrCode} alt="QR Code" className="qr-img" />
                        </div>
                        <div className="ticket-id">
                            <span className="label">TICKET ID</span>
                            <span className="value">#{booking._id.substring(booking._id.length - 8).toUpperCase()}</span>
                        </div>
                        <div className="barcode-mock"></div>
                    </div>
                </div>
                
                <p className="mt-4 text-white opacity-50 small">
                    Presented by EVENT-BUZZ • Scan QR at entrance
                </p>
            </Container>
        </div>
    );
};

export default TicketPage;
