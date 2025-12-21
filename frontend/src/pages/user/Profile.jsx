import { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import authService from '../../services/authService';

const Profile = () => {
    const { user, login } = useContext(AuthContext); // Re-using login/register mechanism to update user context isn't ideal but works for now if we update context
    // Actually, context should expose an update function, but we can verify later. 
    // Implementing local update and manual refresh for now.

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const updatedUser = await authService.updateProfile({
                name,
                email,
                password: password || undefined
            });

            // Hacky reload to refresh context if context doesn't auto-update from localstorage listener
            // Ideally we add updateUser to context
            window.location.reload();
            setMessage('Profile Updated Successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <Container className="py-5">
                <Row className="justify-content-md-center">
                    <Col xs={12} md={6}>
                        <Card className="shadow-sm">
                            <Card.Body className="p-4">
                                <h2 className="text-center mb-4">User Profile</h2>
                                {message && <Alert variant="success">{message}</Alert>}
                                {error && <Alert variant="danger">{error}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Password (Leave blank to keep current)</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="w-100">
                                        Update Profile
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;
