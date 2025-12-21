import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineTicket, HiOutlineCloudUpload } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import eventService from '../../services/eventService';
import LocationPicker from '../../components/events/LocationPicker';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Music',
        date: '',
        venue: '',
        address: '',
        ticketPrice: 0,
        capacity: 100,
        image: '',
        location: { type: 'Point', coordinates: [74.3587, 31.5204] }
    });

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const categories = ['Music', 'Tech', 'Workshop', 'Business', 'Health', 'Art', 'Sports', 'Food'];

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const data = await eventService.getEventById(id);
            // Format date for datetime-local input
            const formattedDate = data.date ? new Date(data.date).toISOString().slice(0, 16) : '';

            setFormData({
                title: data.title || '',
                description: data.description || '',
                category: data.category || 'Music',
                date: formattedDate,
                venue: data.venue || '',
                address: data.address || '',
                ticketPrice: data.ticketPrice || 0,
                capacity: data.capacity || 100,
                image: data.image || '',
                location: data.location || { type: 'Point', coordinates: [74.3587, 31.5204] }
            });
        } catch (err) {
            setError('Failed to load event details. Please return to dashboard.');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const imageUrl = await eventService.uploadImage(file);
            setFormData({ ...formData, image: imageUrl });
            setUploading(false);
        } catch (err) {
            console.error('Upload Error:', err);
            setError('File upload failed. Check your Cloudinary settings.');
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await eventService.updateEvent(id, formData);
            navigate('/organizer/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="bg-light min-vh-100 d-flex flex-column">
                <Navbar />
                <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Spinner animation="grow" variant="primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <Container className="py-5">
                <div className="mb-4 d-flex align-items-center gap-3">
                    <Button as={Link} to="/organizer/dashboard" variant="white" className="rounded-circle shadow-sm border p-2">
                        <HiOutlineArrowLeft size={20} />
                    </Button>
                    <h2 className="fw-bold mb-0">Edit Event</h2>
                </div>

                <Row className="justify-content-center">
                    <Col lg={9}>
                        <Card className="card-custom border-0 shadow-sm overflow-hidden animate-fade-in">
                            <div className="bg-primary p-4 text-white">
                                <h5 className="mb-1 fw-bold">Update Event Content</h5>
                                <p className="small mb-0 opacity-75">Modify your event details carefully</p>
                            </div>
                            <Card.Body className="p-4 p-md-5">
                                {error && <Alert variant="danger" className="rounded-xl">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small text-muted">EVENT TITLE</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="title"
                                            placeholder="Give it a catchy name..."
                                            className="form-control-custom fs-5 fw-semibold"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Row className="mb-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-muted">CATEGORY</Form.Label>
                                                <Form.Select
                                                    name="category"
                                                    className="form-control-custom"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-muted">DATE & TIME</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0"><HiOutlineCalendar /></InputGroup.Text>
                                                    <Form.Control
                                                        type="datetime-local"
                                                        name="date"
                                                        className="form-control-custom"
                                                        value={formData.date}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small text-muted">DESCRIPTION</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            name="description"
                                            placeholder="Update event description..."
                                            className="form-control-custom"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <div className="bg-light p-4 rounded-xl mb-4">
                                        <h6 className="fw-bold mb-3"><HiOutlineLocationMarker className="text-danger me-2" />Venue Updates</h6>
                                        <Row className="g-3 mb-3">
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">VENUE NAME</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="venue"
                                                    placeholder="Venue Name"
                                                    className="form-control-custom"
                                                    value={formData.venue}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">ADDRESS</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    placeholder="Address"
                                                    className="form-control-custom"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                        <div className="mt-3">
                                            <Form.Label className="small text-muted d-block mb-2">UPDATE LOCATION ON MAP</Form.Label>
                                            <LocationPicker
                                                position={formData.location?.coordinates ? [formData.location.coordinates[1], formData.location.coordinates[0]] : [31.5204, 74.3587]}
                                                onLocationSelect={(loc) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        location: { type: 'Point', coordinates: loc.coordinates },
                                                        address: loc.address || prev.address
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-light p-4 rounded-xl mb-4">
                                        <h6 className="fw-bold mb-3"><HiOutlineTicket className="text-primary me-2" />Ticketing Changes</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">PRICE ($)</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-white border-0">$</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        name="ticketPrice"
                                                        className="form-control-custom"
                                                        value={formData.ticketPrice}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </InputGroup>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">CAPACITY</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="capacity"
                                                    className="form-control-custom"
                                                    value={formData.capacity}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                    </div>

                                    <Form.Group className="mb-5">
                                        <Form.Label className="fw-bold small text-muted">EVENT COVER IMAGE</Form.Label>
                                        <div
                                            className="image-upload-zone p-5 text-center rounded-xl border-dashed position-relative mb-3"
                                            style={{ backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6', cursor: 'pointer' }}
                                        >
                                            {formData.image ? (
                                                <div className="position-relative">
                                                    <img
                                                        src={formData.image}
                                                        alt="Cover Preview"
                                                        className="img-fluid rounded mb-3"
                                                        style={{ maxHeight: '300px' }}
                                                    />
                                                    <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
                                                        <Button variant="danger" size="sm" onClick={() => setFormData({ ...formData, image: '' })}>Remove</Button>
                                                        <Button variant="dark" size="sm" onClick={() => document.getElementById('image-upload').click()}>Replace</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div onClick={() => document.getElementById('image-upload').click()}>
                                                    <HiOutlineCloudUpload size={50} className="text-muted mb-3" />
                                                    <h6 className="fw-bold">Upload new cover image</h6>
                                                    {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
                                                </div>
                                            )}
                                            <Form.Control
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="d-none"
                                                onChange={handleUpload}
                                            />
                                        </div>
                                    </Form.Group>

                                    <div className="d-grid pt-3">
                                        <Button
                                            type="submit"
                                            className="btn-primary-custom py-3 fs-5 fw-bold rounded-pill"
                                            disabled={loading || uploading || !formData.image}
                                        >
                                            {loading ? <Spinner size="sm" className="me-2" /> : null}
                                            Save Changes
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EditEvent;
