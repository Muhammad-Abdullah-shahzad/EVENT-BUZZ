import { useState } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineTicket, HiOutlineCloudUpload } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import eventService from '../../services/eventService';
import LocationPicker from '../../components/events/LocationPicker';

const CreateEvent = () => {
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
        gallery: [],
        location: { type: 'Point', coordinates: [74.3587, 31.5204] } // Default location लाहौर
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = ['Music', 'Tech', 'Workshop', 'Business', 'Health', 'Art', 'Sports', 'Food'];

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
            setError('File upload failed. Check your connection.');
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');

        try {
            const urls = await eventService.uploadImages(files);
            setFormData(prev => ({
                ...prev,
                gallery: [...prev.gallery, ...urls]
            }));
            setUploading(false);
        } catch (err) {
            console.error('Gallery Upload Error:', err);
            setError('Some images failed to upload.');
            setUploading(false);
        }
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await eventService.createEvent(formData);
            navigate('/organizer/dashboard', {
                state: { message: 'Event submitted successfully! It will be visible to users once approved by an admin.' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <Container className="py-5">
                <div className="mb-4 d-flex align-items-center gap-3">
                    <Button as={Link} to="/organizer/dashboard" variant="white" className="rounded-circle shadow-sm border p-2">
                        <HiOutlineArrowLeft size={20} />
                    </Button>
                    <h2 className="fw-bold mb-0">Launch New Event</h2>
                </div>

                <Row className="justify-content-center">
                    <Col lg={9}>
                        <Card className="card-custom border-0 shadow-sm overflow-hidden animate-fade-in">
                            <div className="bg-gradient-main p-4 text-white">
                                <h5 className="mb-1 fw-bold">Event Basics</h5>
                                <p className="small mb-0 opacity-75">Fill in the core details for your upcoming experience</p>
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
                                            placeholder="What can attendees expect? Mention schedules, speakers, or performance line-ups."
                                            className="form-control-custom"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <div className="bg-light p-4 rounded-xl mb-4">
                                        <h6 className="fw-bold mb-3"><HiOutlineLocationMarker className="text-danger me-2" />Venue Details</h6>
                                        <Row className="g-3 mb-3">
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">VENUE NAME</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="venue"
                                                    placeholder="Venue Name (e.g. Grand Plaza)"
                                                    className="form-control-custom"
                                                    value={formData.venue}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">STREET ADDRESS</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    placeholder="Full Street Address"
                                                    className="form-control-custom"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                        <div className="mt-3">
                                            <Form.Label className="small text-muted d-block mb-2">PICK LOCATION ON MAP</Form.Label>
                                            <LocationPicker
                                                onLocationSelect={(loc) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        location: { type: 'Point', coordinates: loc.coordinates },
                                                        address: loc.address || prev.address
                                                    }));
                                                }}
                                            />
                                            <Form.Text className="text-muted mt-2 d-inline-block">
                                                Click on the map to set the exact location for attendees.
                                            </Form.Text>
                                        </div>
                                    </div>

                                    <div className="bg-light p-4 rounded-xl mb-4">
                                        <h6 className="fw-bold mb-3"><HiOutlineTicket className="text-primary me-2" />Ticketing & Capacity</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">PRICE (IN RUPEES, 0 FOR FREE)</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-white border-0">Rs.</InputGroup.Text>
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
                                                <Form.Label className="small text-muted">TOTAL CAPACITY</Form.Label>
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

                                    <div className="bg-light p-4 rounded-xl mb-4">
                                        <h6 className="fw-bold mb-3"><HiOutlinePhotograph size={20} className="text-primary me-2" />Visuals</h6>
                                        <Row className="g-4">
                                            <Col md={6}>
                                                <Form.Label className="small text-muted">EVENT POSTER</Form.Label>
                                                <div
                                                    className="upload-box border-dashed rounded-xl p-4 text-center bg-white position-relative"
                                                    style={{ border: '2px dashed #dee2e6', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    {formData.image ? (
                                                        <div className="position-relative w-100">
                                                            <img src={formData.image} alt="Preview" className="img-fluid rounded shadow-sm mb-2" style={{ maxHeight: '150px' }} />
                                                            <div>
                                                                <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={() => setFormData({ ...formData, image: '' })}>Change Poster</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div onClick={() => document.getElementById('poster-upload').click()} style={{ cursor: 'pointer' }}>
                                                            <HiOutlineCloudUpload size={40} className="text-muted mb-2 opacity-50" />
                                                            <p className="small text-muted mb-0">Click to upload poster</p>
                                                            <Form.Control
                                                                id="poster-upload"
                                                                type="file"
                                                                onChange={handleUpload}
                                                                className="d-none"
                                                                accept="image/*"
                                                                disabled={uploading}
                                                            />
                                                            {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Label className="small text-muted">IMAGE GALLERY (OPTIONAL)</Form.Label>
                                                <div
                                                    className="upload-box border-dashed rounded-xl p-4 text-center bg-white position-relative"
                                                    style={{ border: '2px dashed #dee2e6', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    <div onClick={() => document.getElementById('gallery-upload').click()} style={{ cursor: 'pointer' }}>
                                                        <HiOutlineCloudUpload size={30} className="text-muted mb-2 opacity-50" />
                                                        <p className="small text-muted mb-0">Upload multiple images</p>
                                                        <Form.Control
                                                            id="gallery-upload"
                                                            type="file"
                                                            multiple
                                                            onChange={handleGalleryUpload}
                                                            className="d-none"
                                                            accept="image/*"
                                                            disabled={uploading}
                                                        />
                                                        {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2 mt-3">
                                                    {formData.gallery.map((url, idx) => (
                                                        <div key={idx} className="position-relative">
                                                            <img src={url} alt={`Gallery ${idx}`} className="rounded shadow-sm" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: '18px', height: '18px', transform: 'translate(40%, -40%)', fontSize: '10px' }}
                                                                onClick={() => removeGalleryImage(idx)}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="d-grid pt-3">
                                        <Button
                                            type="submit"
                                            className="btn-primary-custom py-3 fs-5 fw-bold rounded-pill"
                                            disabled={loading || uploading || !formData.image}
                                        >
                                            {loading ? <Spinner size="sm" className="me-2" /> : null}
                                            {(!formData.image && !uploading) ? 'Please Upload Cover Image' : 'Publish Your Event'}
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

export default CreateEvent;
