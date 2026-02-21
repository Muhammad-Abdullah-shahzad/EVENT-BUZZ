import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ position, onLocationSelect }) => {
    const [markerPos, setMarkerPos] = useState(position || [31.5204, 74.3587]);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleSearch = async (query, isExplicit = false) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const viewbox = '74.0713,31.7272,74.6186,31.3149';
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&limit=5`);
            const data = await response.json();
            setSuggestions(data);

            // If explicit search (button click), auto-select first result
            if (isExplicit && data.length > 0) {
                handleSelectSuggestion(data[0]);
            }
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);
        const pos = [lat, lon];
        setMarkerPos(pos);
        setSearchQuery(suggestion.display_name);
        setSuggestions([]);
        onLocationSelect({
            type: 'Point',
            coordinates: [lon, lat],
            address: suggestion.display_name
        });
    };

    const LocationMarker = () => {
        const map = useMap();

        useEffect(() => {
            if (markerPos) {
                map.flyTo(markerPos, 16); // Zoom in closer on search
            }
        }, [markerPos, map]);

        useMapEvents({
            async click(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                setMarkerPos([lat, lng]);

                let suggestedAddress = '';
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    suggestedAddress = data.display_name || '';
                    setSearchQuery(suggestedAddress);
                } catch (err) {
                    console.error('Geocoding error:', err);
                }

                onLocationSelect({
                    type: 'Point',
                    coordinates: [lng, lat],
                    address: suggestedAddress
                });
            },
        });

        return markerPos === null ? null : (
            <Marker position={markerPos}></Marker>
        );
    };

    return (
        <div className="location-picker-container position-relative">
            <div className="input-group mb-3 shadow-sm rounded-pill overflow-hidden border-2" style={{ border: '2px solid #eee' }}>
                <input
                    type="text"
                    className="form-control border-0 ps-4 py-2"
                    placeholder="Write location name (e.g. LGU, Royal Palm...)"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch(searchQuery, true))}
                />
                <button
                    className="btn btn-primary px-4"
                    type="button"
                    onClick={() => handleSearch(searchQuery, true)}
                >
                    Locate
                </button>
                {suggestions.length > 0 && (
                    <div className="suggestions-dropdown position-absolute w-100 bg-white shadow-lg rounded-3 mt-1 overflow-hidden"
                        style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto', top: '100%', left: 0 }}>
                        {suggestions.map((s, idx) => (
                            <div
                                key={idx}
                                className="suggestion-item p-3 border-bottom cursor-pointer transition-all hover-bg-light"
                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                onClick={() => handleSelectSuggestion(s)}
                            >
                                <div className="fw-semibold text-dark">{s.display_name.split(',')[0]}</div>
                                <div className="text-muted small">{s.display_name.split(',').slice(1).join(',').trim()}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <MapContainer
                center={markerPos}
                zoom={12}
                maxBounds={[[31.3149, 74.0713], [31.7272, 74.6186]]}
                minZoom={10}
                className="rounded-xl shadow-sm border overflow-hidden"
                style={{ height: '350px', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;
