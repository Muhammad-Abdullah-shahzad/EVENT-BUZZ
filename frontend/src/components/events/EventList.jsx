import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import EventCard from './EventCard';

const EventList = ({ events, loading, error }) => {
    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner
                    animation="border"
                    variant="primary"
                    style={{ width: '3rem', height: '3rem' }}
                    role="status"
                >
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="rounded-3 shadow-sm">
                {error}
            </Alert>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-5 text-muted animate-fade-in">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
                    alt="No events"
                    style={{ width: '120px', opacity: 0.5 }}
                    className="mb-4"
                />
                <h3 className="fw-bold text-dark">No Events Found</h3>
                <p>Try adjusting your search filters to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <Row xs={1} md={2} lg={3} className="g-4 animate-fade-in">
            {events.map((event) => (
                <Col key={event._id}>
                    <EventCard event={event} />
                </Col>
            ))}
        </Row>
    );
};

export default EventList;
