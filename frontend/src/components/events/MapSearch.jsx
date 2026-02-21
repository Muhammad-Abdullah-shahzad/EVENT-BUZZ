import { useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { HiOutlineSearch } from 'react-icons/hi';

const MapSearch = ({ onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleSearch = async (val) => {
        setQuery(val);
        if (val.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            // Priority to Lahore
            const viewbox = '74.0713,31.7272,74.6186,31.3149';
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&viewbox=${viewbox}&limit=5`);
            const data = await response.json();
            setSuggestions(data);
        } catch (err) {
            console.error('Map search error:', err);
        }
    };

    const handleSelect = (s) => {
        const pos = [parseFloat(s.lat), parseFloat(s.lon)];
        onLocationSelect(pos);
        setQuery(s.display_name);
        setSuggestions([]);
    };

    return (
        <div className="map-search-container position-absolute top-0 start-0 m-3" style={{ zIndex: 1000, width: '300px' }}>
            <div className="position-relative">
                <Form.Control
                    type="text"
                    placeholder="Search location (e.g. LGU, Gulberg...)"
                    className="rounded-pill shadow-lg border-0 ps-4 py-2"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                />
                <HiOutlineSearch className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" />

                {suggestions.length > 0 && (
                    <ListGroup className="mt-2 shadow-lg border-0 rounded-xl overflow-hidden animate-fade-in">
                        {suggestions.map((s, idx) => (
                            <ListGroup.Item
                                key={idx}
                                action
                                onClick={() => handleSelect(s)}
                                className="small border-0 border-bottom py-2"
                            >
                                <div className="fw-bold text-dark">{s.display_name.split(',')[0]}</div>
                                <div className="text-muted x-small text-truncate">{s.display_name}</div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </div>
        </div>
    );
};

export default MapSearch;
