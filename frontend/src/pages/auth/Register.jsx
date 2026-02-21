import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineIdentification } from 'react-icons/hi';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register({ name, email, password, role });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center bg-gradient-soft py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col md={7} lg={6}>
                        <Card className="card-custom border-0 p-4 animate-fade-in">
                            <Card.Body>
                                <div className="text-center mb-5">
                                    <h2 className="display-6 fw-bold text-gradient">Create Account</h2>
                                    <p className="text-muted">Join the Event Buzz community today</p>
                                </div>

                                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3" controlId="name">
                                                <Form.Label className="fw-semibold">Full Name</Form.Label>
                                                <div className="position-relative">
                                                    <HiOutlineUser className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={20} />
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="John Doe"
                                                        className="form-control-custom ps-5"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3" controlId="email">
                                        <Form.Label className="fw-semibold">Email Address</Form.Label>
                                        <div className="position-relative">
                                            <HiOutlineMail className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={20} />
                                            <Form.Control
                                                type="email"
                                                placeholder="name@example.com"
                                                className="form-control-custom ps-5"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="password">
                                                <Form.Label className="fw-semibold">Password</Form.Label>
                                                <div className="position-relative">
                                                    <HiOutlineLockClosed className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={20} />
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="form-control-custom ps-5"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="confirmPassword">
                                                <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                                                <div className="position-relative">
                                                    <HiOutlineLockClosed className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={20} />
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="form-control-custom ps-5"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4" controlId="role">
                                        <Form.Label className="fw-semibold">I am an:</Form.Label>
                                        <div className="position-relative">
                                            <HiOutlineIdentification className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={20} />
                                            <Form.Select
                                                className="form-control-custom ps-5"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                            >
                                                <option value="user">Attendee / Discovery User</option>
                                                <option value="organizer">Event Organizer</option>
                                                <option value="admin">System Administrator</option>
                                            </Form.Select>
                                        </div>
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="btn-primary-custom w-100 py-3 mb-4"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </Form>

                                <div className="text-center">
                                    <p className="text-muted mb-0">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;
