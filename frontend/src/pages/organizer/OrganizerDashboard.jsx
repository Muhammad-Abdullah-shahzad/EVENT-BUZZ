import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineCalendar, HiOutlineTicket, HiOutlineCurrencyDollar, HiOutlineUsers, HiOutlineTrendingUp, HiOutlineTrash } from 'react-icons/hi';
import { Alert } from 'react-bootstrap';
import Navbar from '../../components/common/Navbar';
import eventService from '../../services/eventService';
import AuthContext from '../../context/AuthContext';

const OrganizerDashboard = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const successMsg = location.state?.message;

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        ticketsSold: 0,
        revenue: 0,
        pendingBookings: 0
    });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        console.log('Dashboard mounted. User:', user);
        fetchOrganizerData();
    }, [user]);

    const fetchOrganizerData = async () => {
        setLoading(true);
        try {
            console.log('Fetching organizer data for user:', user?._id);
            const data = await eventService.getOrganizerEvents();
            console.log('Organizer events response:', data);

            if (Array.isArray(data)) {
                setEvents(data);
                // Calculate basic stats
                const total = data.length;
                const sold = data.reduce((acc, ev) => acc + (ev.ticketsSold || 0), 0);
                const rev = data.reduce((acc, ev) => acc + ((ev.ticketsSold || 0) * (ev.ticketPrice || 0)), 0);

                setStats({
                    totalEvents: total,
                    ticketsSold: sold,
                    revenue: rev,
                    pendingBookings: 0
                });
            } else {
                console.error('Expected array but got:', typeof data, data);
                setEvents([]);
            }
        } catch (error) {
            console.error('Error fetching organizer data:', error);
            if (error.response) {
                console.error('Server error data:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;
        setDeleteLoading(true);
        try {
            await eventService.deleteEvent(eventToDelete._id);
            setShowDeleteModal(false);
            setEventToDelete(null);
            fetchOrganizerData(); // Refresh list
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete event');
        } finally {
            setDeleteLoading(false);
        }
    };

    const StatusBadge = ({ date, status }) => {
        const isPast = new Date(date) < new Date();

        if (status === 'pending') {
            return <Badge bg="warning" className="rounded-pill px-3">Pending Review</Badge>;
        }
        if (status === 'rejected') {
            return <Badge bg="danger" className="rounded-pill px-3">Rejected</Badge>;
        }

        return (
            <Badge bg={isPast ? 'secondary' : 'success'} className="rounded-pill px-3">
                {isPast ? 'Past' : 'Approved'}
            </Badge>
        );
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <Container className="py-5 animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 className="fw-bold text-dark mb-1">Organizer Dashboard</h1>
                        <p className="text-muted">Manage your events and track performance</p>
                    </div>
                    <Button as={Link} to="/organizer/create-event" className="btn-primary-custom px-4 py-2">
                        <HiOutlinePlus className="me-2" /> Create New Event
                    </Button>
                </div>

                {successMsg && <Alert variant="success" className="rounded-xl shadow-sm mb-4 animate-fade-in">{successMsg}</Alert>}

                <Row className="g-4 mb-5">
                    <Col md={3}>
                        <Card className="card-custom border-0 h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-xl me-3">
                                    <HiOutlineCalendar size={30} className="text-primary" />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0">Total Events</h6>
                                    <h3 className="fw-bold mb-0">{stats.totalEvents}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-custom border-0 h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 p-3 rounded-xl me-3">
                                    <HiOutlineTicket size={30} className="text-success" />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0">Tickets Sold</h6>
                                    <h3 className="fw-bold mb-0">{stats.ticketsSold}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-custom border-0 h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className="bg-info bg-opacity-10 p-3 rounded-xl me-3">
                                    <HiOutlineCurrencyDollar size={30} className="text-info" />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0">Total Revenue</h6>
                                    <h3 className="fw-bold mb-0">Rs. {stats.revenue.toFixed(2)}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-custom border-0 h-100 shadow-sm bg-gradient-main text-white">
                            <Card.Body className="d-flex align-items-center">
                                <div className="bg-white bg-opacity-20 p-3 rounded-xl me-3">
                                    <HiOutlineTrendingUp size={30} className="text-white" />
                                </div>
                                <div>
                                    <h6 className="opacity-75 mb-0">Growth</h6>
                                    <h3 className="fw-bold mb-0">+12%</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <h3 className="fw-bold mb-4">Your Events</h3>
                <Card className="card-custom border-0 overflow-hidden">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Event Details</th>
                                <th className="py-3">Category</th>
                                <th className="py-3">Date</th>
                                <th className="py-3">Tickets</th>
                                <th className="py-3">Status</th>
                                <th className="py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <p className="mb-0">You haven't created any events yet.</p>
                                        <Link to="/organizer/create-event" className="text-primary fw-bold">Create your first event</Link>
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => {
                                    const imageUrl = event.image?.startsWith('http')
                                        ? event.image
                                        : event.image?.startsWith('/uploads')
                                            ? `http://localhost:5000${event.image}`
                                            : 'https://via.placeholder.com/40';
                                    return (
                                        <tr key={event._id} className="align-middle">
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={imageUrl}
                                                        alt={event.title}
                                                        className="rounded me-3"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                    <span className="fw-bold">{event.title}</span>
                                                </div>
                                            </td>
                                            <td><Badge bg="light" className="text-dark border rounded-pill px-3">{event.category}</Badge></td>
                                            <td>{new Date(event.date).toLocaleDateString()}</td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <small className="text-muted">{event.ticketsSold} / {event.capacity} sold</small>
                                                    <div className="progress mt-1" style={{ height: '4px', width: '100px' }}>
                                                        <div
                                                            className="progress-bar bg-primary"
                                                            style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><StatusBadge date={event.date} status={event.status} /></td>
                                            <td className="text-end pe-4">
                                                <Button as={Link} to={`/organizer/edit-event/${event._id}`} variant="outline-primary" size="sm" className="me-2 rounded-pill">
                                                    Edit
                                                </Button>
                                                <Button as={Link} to={`/events/${event._id}`} variant="outline-dark" size="sm" className="me-2 rounded-pill">
                                                    View
                                                </Button>
                                                <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={() => handleDeleteClick(event)}>
                                                    <HiOutlineTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </Card>
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Delete Event?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{eventToDelete?.title}</strong>? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" className="rounded-pill px-4" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                        {deleteLoading ? <Spinner size="sm" /> : 'Delete Event'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrganizerDashboard;
