import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center bg-gradient-soft py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="card-custom border-0 p-4 animate-fade-in">
                            <Card.Body>
                                <div className="text-center mb-5">
                                    <h2 className="display-6 fw-bold text-gradient">Welcome Back</h2>
                                    <p className="text-muted">Enter your details to access your account</p>
                                </div>

                                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4" controlId="email">
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

                                    <Form.Group className="mb-4" controlId="password">
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

                                    <Button
                                        type="submit"
                                        className="btn-primary-custom w-100 py-3 mb-4"
                                        disabled={loading}
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </Form>

                                <div className="text-center">
                                    <p className="text-muted mb-0">
                                        Don't have an account?{' '}
                                        <Link to="/register" className="text-primary fw-bold text-decoration-none">
                                            Create Account
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

export default Login;
