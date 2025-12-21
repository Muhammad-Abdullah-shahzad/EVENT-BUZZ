import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineTicket } from 'react-icons/hi';

const EventCard = ({ event }) => {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const imageUrl = event.image?.startsWith('http')
        ? event.image
        : event.image?.startsWith('/uploads')
            ? `http://localhost:5000${event.image}`
            : `https://source.unsplash.com/800x600/?${event.category},event`;

    return (
        <Card className="card-custom h-100 hover-lift border-0">
            <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
                <Card.Img
                    variant="top"
                    src={imageUrl}
                    className="w-100 h-100 object-fit-cover transition-all"
                    style={{ transition: 'transform 0.5s ease' }}
                />
                <div className="position-absolute top-0 end-0 m-3">
                    <Badge bg="white" className="text-dark shadow-sm px-3 py-2 rounded-pill fw-bold">
                        {event.category}
                    </Badge>
                </div>
                {event.ticketPrice === 0 && (
                    <div className="position-absolute bottom-0 start-0 m-3">
                        <Badge bg="success" className="shadow-sm px-3 py-2 rounded-pill">
                            FREE
                        </Badge>
                    </div>
                )}
            </div>

            <Card.Body className="p-4 d-flex flex-column">
                <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                    <HiOutlineCalendar className="text-primary" />
                    <span>{formattedDate}</span>
                </div>

                <h5 className="fw-bold mb-2 text-dark line-clamp-2" style={{ height: '3rem' }}>
                    {event.title}
                </h5>

                <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                    <HiOutlineLocationMarker className="text-danger" />
                    <span className="text-truncate">{event.venue}</span>
                </div>

                <p className="text-muted small mb-4 flex-grow-1 line-clamp-3">
                    {event.description}
                </p>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                    <div>
                        <span className="text-muted small d-block">Price</span>
                        <span className="fs-5 fw-bold text-gradient">
                            {event.ticketPrice > 0 ? `Rs. ${event.ticketPrice.toFixed(2)}` : 'Entry Free'}
                        </span>
                    </div>
                    <Button
                        as={Link}
                        to={`/events/${event._id}`}
                        className="btn-primary-custom px-4 rounded-pill"
                    >
                        Details
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default EventCard;
