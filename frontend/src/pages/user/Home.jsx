import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { HiOutlineSearch, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineFilter, HiOutlineCursorClick } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import EventList from '../../components/events/EventList';
import EventMap from '../../components/events/EventMap';
import eventService from '../../services/eventService';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const [mapCenter, setMapCenter] = useState([31.5204, 74.3587]);
    const [locating, setLocating] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [locationSearch, setLocationSearch] = useState('');

    const categories = ['All', 'Music', 'Tech', 'Workshop', 'Business', 'Health', 'Art', 'Sports', 'Food'];

    useEffect(() => {
        fetchEvents();
    }, [category, userLocation]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {
                category: category !== 'All' ? category : '',
                ...userLocation
            };
            const data = await eventService.getEvents(params);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Filtering is handled locally or via API
        // For now, let's just trigger a fetch if needed or filter the list
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLocation = !locationSearch ||
            (event.address && event.address.toLowerCase().includes(locationSearch.toLowerCase())) ||
            (event.venue && event.venue.toLowerCase().includes(locationSearch.toLowerCase()));

        return matchesSearch && matchesLocation;
    });

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        if (userLocation) {
            setUserLocation(null);
            // Optional: Switch back to grid or stay in map? 
            // User said "show all events", implied removing filter. 
            // Usually reseting viewMode to grid is expected behavior for "turning off" map mode.
            // But let's just remove the location filter.
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMapCenter([latitude, longitude]);
                setUserLocation({ lat: latitude, lng: longitude, distance: 25 });
                setViewMode('map');
                setLocating(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                setLocating(false);
                alert('Could not get your location. Please check permissions.');
            }
        );
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-aesthetic-hero text-white py-5 mb-5 position-relative overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-noise opacity-10"></div>
                <div className="position-absolute top-0 end-0 w-50 h-100 bg-gradient-glow opacity-20 blur-3xl"></div>
                <Container className="py-5 position-relative z-index-1 animate-fade-in text-center">
                    <h1 className="display-3 fw-bold mb-3">Discover Authentic <br /><span className="text-gradient">Experiences.</span></h1>
                    <p className="lead mb-5 opacity-75 mx-auto" style={{ maxWidth: '700px' }}>
                        Join thousands of people discovering local events, from concerts to workshops.
                        Event Buzz is your gate to the most exciting happenings around you.
                    </p>

                    <div className="glass-dark p-3 rounded-pill mx-auto shadow-lg" style={{ maxWidth: '800px' }}>
                        <Form onSubmit={handleSearch}>
                            <Row className="g-2 align-items-center">
                                <Col md={5}>
                                    <InputGroup className="bg-transparent border-0">
                                        <InputGroup.Text className="bg-transparent border-0 text-white">
                                            <HiOutlineSearch size={22} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="What are you looking for?"
                                            className="bg-transparent border-0 text-white placeholder-light shadow-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={4} className="d-none d-md-block">
                                    <InputGroup className="bg-transparent border-0 border-start border-secondary">
                                        <InputGroup.Text className="bg-transparent border-0 text-white">
                                            <HiOutlineLocationMarker size={22} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="City or Venue..."
                                            className="bg-transparent border-0 text-white placeholder-light shadow-none"
                                            value={locationSearch}
                                            onChange={(e) => setLocationSearch(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={3}>
                                    <Button type="submit" className="btn-primary-custom w-100 rounded-pill py-2">
                                        Find Events
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Container>
            </div>

            <main>
                <Container className="pb-5">
                    {/* Category Filter */}
                    <div className="d-flex flex-wrap gap-2 mb-5 justify-content-center">
                        {categories.map((cat) => (
                            <div
                                key={cat}
                                className={`badge-filter px-4 py-2 rounded-pill fs-6 cursor-pointer hover-scale ${category === cat || (cat === 'All' && !category) ? 'active' : ''
                                    }`}
                                onClick={() => setCategory(cat)}
                                style={{ cursor: 'pointer' }}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-end mb-4">
                        <div>
                            <h2 className="fw-bold mb-1">Upcoming Events</h2>
                            <p className="text-muted">Handpicked events just for you</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                                className="rounded-pill px-3"
                                onClick={() => setViewMode('grid')}
                            >
                                Grid View
                            </Button>
                            <Button
                                variant={viewMode === 'map' ? 'primary' : 'outline-primary'}
                                className="rounded-pill px-3"
                                onClick={() => setViewMode('map')}
                            >
                                Map View
                            </Button>
                            <Button
                                variant={userLocation ? 'primary' : 'outline-primary'}
                                className="rounded-pill px-3 d-flex align-items-center gap-2"
                                onClick={handleLocateMe}
                                disabled={locating}
                            >
                                {locating ? <Spinner size="sm" /> : <HiOutlineCursorClick />}
                                Events Near Me
                            </Button>
                        </div>
                    </div>

                    {/* Event List or Map View */}
                    {viewMode === 'grid' ? (
                        <EventList events={filteredEvents} loading={loading} />
                    ) : (
                        <div className="animate-fade-in shadow-sm rounded-xl overflow-hidden border">
                            <EventMap events={filteredEvents} center={mapCenter} />
                        </div>
                    )}
                </Container>
            </main>

            <footer className="bg-dark text-white py-5 mt-5">
                <Container className="text-center opacity-75">
                    <p className="mb-0">© 2025 Event Buzz. All rights reserved.</p>
                </Container>
            </footer>
        </div >
    );
};

export default Home;
