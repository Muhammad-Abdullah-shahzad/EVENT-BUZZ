import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const MapAutoCenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const EventMap = ({ events = [], center = [31.5204, 74.3587], zoom = 12 }) => {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            minZoom={3}
            scrollWheelZoom={false}
            style={{ height: '500px', width: '100%', borderRadius: '15px' }}
        >
            <MapAutoCenter center={center} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.map(event => {
                if (!event.location || !event.location.coordinates) return null;
                const position = [event.location.coordinates[1], event.location.coordinates[0]];

                const customIcon = L.divIcon({
                    className: 'custom-map-marker',
                    html: '',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    popupAnchor: [0, -15]
                });

                return (
                    <Marker key={event._id} position={position} icon={customIcon}>
                        <Tooltip
                            direction="top"
                            offset={[0, -15]}
                            opacity={1}
                            className="custom-map-tooltip"
                            permanent={false}
                        >
                            <div style={{ width: '200px', background: 'white', borderRadius: '0.75rem', overflow: 'hidden' }}>
                                <img
                                    src={event.image || 'https://via.placeholder.com/200x120'}
                                    alt={event.title}
                                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                                />
                                <div style={{ padding: '12px' }}>
                                    <h6 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{event.title}</h6>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>{event.venue}</p>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#1e3a8a', fontWeight: '600' }}>
                                        {event.isPaid ? `$${event.ticketPrice}` : 'Free'}
                                    </p>
                                </div>
                            </div>
                        </Tooltip>
                        <Popup>
                            <div className="p-1">
                                <h6 className="fw-bold mb-1">{event.title}</h6>
                                <p className="small mb-2 text-muted">{event.venue}</p>
                                <Link to={`/events/${event._id}`} className="btn btn-primary btn-sm w-100 text-white">
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default EventMap;
