import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Alert, Button, Modal, Dropdown } from 'react-bootstrap';
import { HiOutlineUsers, HiOutlineCalendar, HiOutlineTicket, HiOutlineCurrencyDollar, HiOutlineShieldCheck, HiOutlineDotsVertical, HiOutlineTrash, HiOutlineUserRemove } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, events: 0, bookings: 0, revenue: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsData = await adminService.getStats();
            const usersData = await adminService.getUsers();
            setStats(statsData);
            setUsers(usersData);
        } catch (err) {
            setError('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            fetchData(); // Refresh
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
            fetchData(); // Refresh
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
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
            <Container className="py-5 animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 className="fw-bold text-dark mb-1 text-gradient">Platform Control Center</h1>
                        <p className="text-muted">High-level overview and administrative management</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="white" className="shadow-sm border rounded-pill px-4" onClick={fetchData}>
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {error && <Alert variant="danger" className="rounded-xl">{error}</Alert>}

                {/* Stats Cards */}
                <Row className="mb-5 g-4 text-center">
                    <Col md={3}>
                        <Card className="card-custom border-0 hover-lift h-100">
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
                        <Card className="card-custom border-0 hover-lift h-100">
                            <Card.Body>
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineCurrencyDollar size={28} className="text-success" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1">TOTAL REVENUE</h6>
                                <h3 className="fw-bold mb-0">Rs. {stats.revenue.toLocaleString()}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-custom border-0 hover-lift h-100">
                            <Card.Body>
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineCalendar size={28} className="text-info" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1">TOTAL EVENTS</h6>
                                <h3 className="fw-bold mb-0">{stats.events}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-custom border-0 hover-lift h-100">
                            <Card.Body>
                                <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <HiOutlineTicket size={28} className="text-warning" />
                                </div>
                                <h6 className="text-muted small fw-bold mb-1">TOTAL BOOKINGS</h6>
                                <h3 className="fw-bold mb-0">{stats.bookings}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Users Management */}
                <Card className="card-custom border-0 overflow-hidden shadow-sm">
                    <Card.Header className="bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold mb-0">Registered Users</h4>
                        <div className="d-flex gap-2">
                            <input type="text" placeholder="Search users..." className="form-control form-control-sm rounded-pill px-3 shadow-none border" style={{ width: '250px' }} />
                        </div>
                    </Card.Header>
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} className="align-middle">
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                <HiOutlineUsers className="text-muted" />
                                            </div>
                                            <div>
                                                <div className="fw-bold">{user.name}</div>
                                                <small className="text-muted">ID: {user._id.slice(-6)}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <Badge
                                            bg={user.role === 'admin' ? 'danger' : user.role === 'organizer' ? 'info' : 'secondary'}
                                            className="rounded-pill px-3"
                                        >
                                            {user.role.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                                    <td>
                                        <span className="d-flex align-items-center gap-1 text-success small fw-bold">
                                            <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                            Verified
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Dropdown align="end">
                                            <Dropdown.Toggle as={Button} variant="link" className="text-muted p-0 shadow-none">
                                                <HiOutlineDotsVertical />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="border-0 shadow-lg rounded-xl p-2" style={{ minWidth: '180px' }}>
                                                <Dropdown.Header className="small fw-bold text-muted px-3">CHANGE ROLE</Dropdown.Header>
                                                <Dropdown.Item className="small rounded-pill" onClick={() => handleRoleChange(user._id, 'user')} disabled={user.role === 'user'}>Make User</Dropdown.Item>
                                                <Dropdown.Item className="small rounded-pill" onClick={() => handleRoleChange(user._id, 'organizer')} disabled={user.role === 'organizer'}>Make Organizer</Dropdown.Item>
                                                <Dropdown.Item className="small rounded-pill" onClick={() => handleRoleChange(user._id, 'admin')} disabled={user.role === 'admin'}>Make Admin</Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item
                                                    className="text-danger small rounded-pill mt-2"
                                                    onClick={() => handleDeleteClick(user)}
                                                    disabled={user.role === 'admin'}
                                                >
                                                    <HiOutlineTrash className="me-2" /> Delete Account
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">Delete Account?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center py-4">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                            <HiOutlineUserRemove size={40} className="text-danger" />
                        </div>
                        <h5>Are you sure?</h5>
                        <p className="text-muted">
                            This will permanently delete <strong>{userToDelete?.name}</strong>'s account. This action cannot be undone.
                        </p>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4">
                        <Button variant="light" className="flex-grow-1 rounded-pill" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-grow-1 rounded-pill"
                            onClick={confirmDeleteUser}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Spinner size="sm" /> : 'Delete User'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default AdminDashboard;
