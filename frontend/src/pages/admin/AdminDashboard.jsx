import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Alert, Button, Modal, Dropdown, Form } from 'react-bootstrap';
import { HiOutlineUsers, HiOutlineCalendar, HiOutlineTicket, HiOutlineCurrencyDollar, HiOutlineDotsVertical, HiOutlineTrash, HiOutlineUserRemove, HiOutlineCheck, HiOutlineX, HiOutlineTrendingUp } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import adminService from '../../services/adminService';
import AuthContext from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [stats, setStats] = useState({ users: 0, events: 0, bookings: 0, revenue: 0 });
    const [users, setUsers] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'events'

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [eventToReject, setEventToReject] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Fetching admin data...');
            const [statsData, usersData, pendingData] = await Promise.all([
                adminService.getStats().catch(err => { console.error('Stats error:', err); return { users: 0, events: 0, bookings: 0, revenue: 0 }; }),
                adminService.getUsers().catch(err => { console.error('Users error:', err); return []; }),
                adminService.getPendingEvents().catch(err => { console.error('Pending events error:', err); return []; })
            ]);

            console.log('Stats received:', statsData);
            console.log('Users received:', usersData?.length);
            console.log('Pending events received:', pendingData?.length);

            setStats({
                users: usersData?.length || statsData?.users || 0,
                events: statsData?.events || 0,
                bookings: statsData?.bookings || 0,
                revenue: statsData?.revenue || 0,
                pendingEvents: pendingData?.length || statsData?.pendingEvents || 0
            });
            setUsers(Array.isArray(usersData) ? usersData : []);
            setPendingEvents(Array.isArray(pendingData) ? pendingData : []);
        } catch (err) {
            setError('Failed to load dashboard data. Please check your connection and try again.');
            console.error('Fetch data error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // User Handlers
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        setActionLoading(true);
        try {
            await adminService.deleteUser(userToDelete._id);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(true);
        try {
            await adminService.updateUserRole(userId, newRole);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
        } finally {
            setActionLoading(false);
        }
    };

    // Event Handlers
    const handleApproveEvent = async (eventId) => {
        setActionLoading(true);
        try {
            await adminService.approveEvent(eventId);
            fetchData();
        } catch (err) {
            alert('Failed to approve event');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectClick = (event) => {
        setEventToReject(event);
        setShowRejectModal(true);
    };

    const confirmRejectEvent = async () => {
        if (!eventToReject) return;
        setActionLoading(true);
        try {
            await adminService.rejectEvent(eventToReject._id, rejectReason);
            setShowRejectModal(false);
            setEventToReject(null);
            setRejectReason('');
            fetchData();
        } catch (err) {
            alert('Failed to reject event');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <Container className="py-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 className="fw-bold text-dark mb-1">Platform Control Center</h1>
                        <p className="text-muted">Manage users, events, and platform statistics</p>
                    </div>
                    <Button variant="outline-primary" className="shadow-sm rounded-pill px-4" onClick={fetchData}>
                        Refresh Data
                    </Button>
                </div>

                {error && <Alert variant="danger" className="rounded-3 shadow-sm mb-4">{error}</Alert>}

                {/* Stats Summary */}
                <Row className="mb-5 g-4 text-center">
                    <Col md={2}>
                        <Card className="card-custom border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineUsers size={28} className="text-primary" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1">TOTAL USERS</h6>
                                <h3 className="fw-bold mb-0">{stats.users}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-custom border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineCurrencyDollar size={28} className="text-success" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1">TOTAL REVENUE</h6>
                                <h3 className="fw-bold mb-0">Rs. {(stats.revenue || 0).toLocaleString()}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={2}>
                        <Card className="card-custom border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineCalendar size={28} className="text-info" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1">LIVE EVENTS</h6>
                                <h3 className="fw-bold mb-0">{stats.events}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-custom border-0 shadow-sm h-100 border border-warning border-opacity-25 bg-warning bg-opacity-10">
                            <Card.Body>
                                <div className="bg-warning bg-opacity-25 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineTrendingUp size={28} className="text-warning" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1 text-warning-emphasis">PENDING APPROVALS</h6>
                                <h3 className="fw-bold mb-0 text-warning-emphasis">{stats.pendingEvents}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={2}>
                        <Card className="card-custom border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="bg-secondary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineTicket size={28} className="text-secondary" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1">BOOKINGS</h6>
                                <h3 className="fw-bold mb-0">{stats.bookings}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Registered Users Section */}
                <div id="registered-users" className="mb-5">
                    <Card className="card-custom border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold mb-0">Registered Users</h4>
                            <Badge bg="primary" pill>{users.length} Users</Badge>
                        </Card.Header>
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map(user => (
                                    <tr key={user._id} className="align-middle">
                                        <td className="ps-4">
                                            <div className="fw-bold">{user.name}</div>
                                            <small className="text-muted">ID: {user._id ? user._id.slice(-6) : 'N/A'}</small>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Badge bg={user.role === 'superadmin' ? 'warning' : user.role === 'admin' ? 'danger' : user.role === 'organizer' ? 'info' : 'secondary'} text={user.role === 'superadmin' ? 'dark' : 'white'} className="rounded-pill px-3">
                                                {(user.role || 'user').toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="text-end pe-4">
                                            <Dropdown align="end">
                                                <Dropdown.Toggle as={Button} variant="link" className="text-muted p-0 shadow-none">
                                                    <HiOutlineDotsVertical />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="border-0 shadow-lg p-2 rounded-lg">
                                                    <Dropdown.Header className="small fw-bold">UPDATE ROLE</Dropdown.Header>
                                                    <Dropdown.Item onClick={() => handleRoleChange(user._id, 'user')} disabled={user.role === 'user'}>Make User</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleRoleChange(user._id, 'organizer')} disabled={user.role === 'organizer'}>Make Organizer</Dropdown.Item>
                                                    
                                                    {currentUser?.role === 'superadmin' && (
                                                        <>
                                                            <Dropdown.Item onClick={() => handleRoleChange(user._id, 'admin')} disabled={user.role === 'admin'}>Make Admin</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleRoleChange(user._id, 'superadmin')} disabled={user.role === 'superadmin'}>Make Super Admin</Dropdown.Item>
                                                        </>
                                                    )}
                                                    
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item 
                                                        className="text-danger" 
                                                        onClick={() => handleDeleteClick(user)} 
                                                        disabled={
                                                            user.role === 'superadmin' || 
                                                            (user.role === 'admin' && currentUser?.role !== 'superadmin')
                                                        }
                                                    >
                                                        <HiOutlineTrash className="me-2" /> Delete Account
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </div>

                {/* Pending Content Approvals Section */}
                <div id="pending-approvals">
                    <Card className="card-custom border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold mb-0">Pending Content Approvals</h4>
                            <Badge bg="warning" text="dark" pill>{pendingEvents.length} Pending</Badge>
                        </Card.Header>
                        {pendingEvents.length > 0 ? (
                            <Table hover responsive className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Event Details</th>
                                        <th>Organizer</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingEvents.map(event => (
                                        <tr key={event._id} className="align-middle">
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={event.image?.startsWith('http')
                                                            ? event.image
                                                            : event.image?.startsWith('/uploads')
                                                                ? `http://localhost:5000${event.image}`
                                                                : 'https://via.placeholder.com/60'
                                                        }
                                                        alt=""
                                                        className="rounded me-3 border shadow-sm"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                    <div>
                                                        <div className="fw-bold">{event.title}</div>
                                                        <div className="small text-muted">{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'} @ {event.venue}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-bold">{event.user?.name || 'Unknown'}</div>
                                                <div className="x-small text-muted">{event.user?.email || ''}</div>
                                            </td>
                                            <td>
                                                <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3">
                                                    {event.category}
                                                </Badge>
                                            </td>
                                            <td>{event.ticketPrice > 0 ? `Rs.${event.ticketPrice}` : 'Free'}</td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="rounded-pill px-3"
                                                        onClick={() => handleApproveEvent(event._id)}
                                                        disabled={actionLoading}
                                                    >
                                                        <HiOutlineCheck className="me-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="rounded-pill px-3"
                                                        onClick={() => handleRejectClick(event)}
                                                        disabled={actionLoading}
                                                    >
                                                        <HiOutlineX className="me-1" /> Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center py-5">
                                <div className="bg-light rounded-circle p-4 d-inline-block mb-3 shadow-sm">
                                    <HiOutlineCalendar size={48} className="text-muted opacity-25" />
                                </div>
                                <h5 className="fw-bold">No Pending Approvals</h5>
                                <p className="text-muted">All clear! No events are waiting for review.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Delete Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">Delete Account?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center py-4">
                        <HiOutlineUserRemove size={64} className="text-danger mb-3 opacity-75" />
                        <p className="text-muted px-4">
                            Are you certain you want to remove <strong>{userToDelete?.name}</strong>? This will purge all associated data.
                        </p>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4">
                        <Button variant="light" className="flex-grow-1 rounded-pill" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="danger" className="flex-grow-1 rounded-pill" onClick={confirmDeleteUser} disabled={actionLoading}>
                            {actionLoading ? <Spinner size="sm" /> : 'Delete'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Reject Modal */}
                <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">Reject Application</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted">REASON FOR REJECTION</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Explain why this event is being rejected..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="rounded-lg"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4">
                        <Button variant="light" className="flex-grow-1 rounded-pill" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                        <Button variant="danger" className="flex-grow-1 rounded-pill" onClick={confirmRejectEvent} disabled={actionLoading}>
                            Confirm Rejection
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default AdminDashboard;
