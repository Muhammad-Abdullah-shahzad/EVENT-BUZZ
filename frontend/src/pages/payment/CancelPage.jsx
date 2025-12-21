import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HiXCircle } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';

const CancelPage = () => {
    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <Container className="py-5 d-flex justify-content-center">
                <Card className="card-custom border-0 shadow-lg text-center p-5" style={{ maxWidth: '500px' }}>
                    <HiXCircle size={80} className="text-warning mx-auto mb-3" />
                    <h2 className="fw-bold text-dark">Payment Cancelled</h2>
                    <p className="text-muted mb-4">You have cancelled the payment process. No charges were made.</p>
                    <div className="d-grid gap-2">
                        <Button as={Link} to="/" variant="dark" className="rounded-pill py-3">
                            Explore More Events
                        </Button>
                        <Button as={Link} to="/user/bookings" variant="light" className="rounded-pill py-3">
                            View My Bookings
                        </Button>
                    </div>
                </Card>
            </Container>
        </div>
    );
};

export default CancelPage;
