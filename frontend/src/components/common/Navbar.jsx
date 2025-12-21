import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';
import { HiOutlineUserCircle, HiOutlineLogout, HiOutlineCalendar, HiOutlinePlusCircle, HiOutlineChartBar, HiOutlineSearch } from 'react-icons/hi';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
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

                <BsNavbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

                <BsNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center gap-2">
                        <Nav.Link as={Link} to="/" className="fw-semibold px-3">
                            <HiOutlineSearch className="me-1" /> Discover
                        </Nav.Link>

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
