import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import NotificationContext from '../../context/NotificationContext';
import { HiOutlineUserCircle, HiOutlineLogout, HiOutlineCalendar, HiOutlinePlusCircle, HiOutlineChartBar, HiOutlineSearch, HiOutlineSun, HiOutlineMoon, HiOutlineBell, HiOutlineTrash } from 'react-icons/hi';
import { Badge, Dropdown } from 'react-bootstrap';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const { notifications, unreadCount, markAsRead, deleteNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <BsNavbar expand="lg" sticky="top" className="glass py-3">
            <Container>
                <BsNavbar.Brand as={Link} to="/" className="navbar-brand-custom text-gradient">
                    Event<span className="text-dark">Buzz</span>
                </BsNavbar.Brand>

                <div className="d-flex align-items-center gap-2 d-lg-none">
                    {user && (
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="p-2 text-dark shadow-none position-relative">
                                <HiOutlineBell size={24} />
                                {unreadCount > 0 && (
                                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle-x p-1" style={{ fontSize: '0.6rem' }}>
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="notification-dropdown shadow-lg border-0 p-0 overflow-hidden" style={{ width: '300px' }}>
                                <div className="p-3 bg-primary text-white d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Notifications</h6>
                                    <Badge bg="light" text="dark">{unreadCount} New</Badge>
                                </div>
                                <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                                    {notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <div key={n._id} className={`p-3 border-bottom notification-item ${!n.isRead ? 'unread' : ''}`} onClick={() => markAsRead(n._id)}>
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <small className="fw-bold">{n.title}</small>
                                                    <Button variant="link" className="p-0 text-muted" onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}>
                                                        <HiOutlineTrash size={14} />
                                                    </Button>
                                                </div>
                                                <p className="small mb-1 text-muted">{n.message}</p>
                                                <small className="x-small text-primary">{new Date(n.createdAt).toLocaleDateString()}</small>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-muted">No notifications</div>
                                    )}
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                    <Button
                        variant="link"
                        className="p-2 text-dark shadow-none"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? <HiOutlineSun size={22} /> : <HiOutlineMoon size={22} />}
                    </Button>
                    <BsNavbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
                </div>

                <BsNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center gap-2">
                        <Nav.Link as={Link} to="/" className="fw-semibold px-3">
                            <HiOutlineSearch className="me-1" /> Discover
                        </Nav.Link>

                        <Button
                            variant="link"
                            className="p-2 text-dark shadow-none d-none d-lg-block mx-2 hover-scale"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <HiOutlineSun size={22} /> : <HiOutlineMoon size={22} />}
                        </Button>

                        {user && (
                            <Dropdown align="end" className="d-none d-lg-block mx-2">
                                <Dropdown.Toggle variant="link" className="p-2 text-dark shadow-none position-relative hover-scale">
                                    <HiOutlineBell size={24} />
                                    {unreadCount > 0 && (
                                        <Badge pill bg="danger" className="position-absolute top-10 start-90 translate-middle p-1" style={{ fontSize: '0.6rem' }}>
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="notification-dropdown shadow-lg border-0 p-0 overflow-hidden" style={{ width: '320px' }}>
                                    <div className="p-3 bg-primary text-white d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 fw-bold">Notifications</h6>
                                        <Badge bg="light" text="dark" pill>{unreadCount} New</Badge>
                                    </div>
                                    <div className="overflow-auto bg-card" style={{ maxHeight: '400px' }}>
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div
                                                    key={n._id}
                                                    className={`p-3 border-bottom notification-item transition-all cursor-pointer ${!n.isRead ? 'bg-light-glow' : ''}`}
                                                    onClick={() => markAsRead(n._id)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <span className={`small fw-bold ${!n.isRead ? 'text-primary' : 'text-main'}`}>{n.title}</span>
                                                        <Button variant="link" className="p-0 text-muted hover-text-danger" onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}>
                                                            <HiOutlineTrash size={14} />
                                                        </Button>
                                                    </div>
                                                    <p className="small mb-1 text-muted line-clamp-2">{n.message}</p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </small>
                                                        {!n.isRead && <div className="bg-primary rounded-circle" style={{ width: '6px', height: '6px' }}></div>}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-5 text-center text-muted">
                                                <HiOutlineBell size={30} className="mb-2 opacity-25" />
                                                <p className="small mb-0">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-2 border-top text-center bg-light">
                                            <small className="text-primary cursor-pointer hover-underline">View all</small>
                                        </div>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        )}

                        {user ? (
                            <>
                                {user.role === 'organizer' && (
                                    <>
                                        <Nav.Link as={Link} to="/organizer/dashboard" className="fw-semibold px-3">
                                            <HiOutlineChartBar className="me-1" /> Dashboard
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/organizer/create-event" className="fw-semibold px-3 text-primary">
                                            <HiOutlinePlusCircle className="me-1" /> Create Event
                                        </Nav.Link>
                                    </>
                                )}

                                {user.role === 'admin' && (
                                    <Nav.Link as={Link} to="/admin/dashboard" className="fw-semibold px-3">
                                        <HiOutlineChartBar className="me-1" /> Admin Panel
                                    </Nav.Link>
                                )}

                                {user.role === 'user' && (
                                    <Nav.Link as={Link} to="/user/bookings" className="fw-semibold px-3">
                                        <HiOutlineCalendar className="me-1" /> My Bookings
                                    </Nav.Link>
                                )}

                                <NavDropdown
                                    title={
                                        <span className="d-inline-flex align-items-center gap-2 fw-semibold">
                                            <HiOutlineUserCircle size={24} className="text-primary" />
                                            {user.name}
                                        </span>
                                    }
                                    id="user-nav-dropdown"
                                    align="end"
                                    className="ms-2"
                                >
                                    <NavDropdown.Item as={Link} to="/profile">
                                        <HiOutlineUserCircle className="me-2" /> Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                        <HiOutlineLogout className="me-2" /> Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline-primary border-0 fw-bold px-4">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary-custom px-4">
                                    Join Now
                                </Link>
                            </>
                        )}
                    </Nav>
                </BsNavbar.Collapse>
            </Container>
        </BsNavbar>
    );
};

export default Navbar;
