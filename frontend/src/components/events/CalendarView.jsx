import { useState, useContext } from 'react';
import { Badge, Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import LanguageContext from '../../context/LanguageContext';

const CalendarView = ({ events }) => {
    const { language, t } = useContext(LanguageContext);
    const [currentDate, setCurrentDate] = useState(new Date());

    const onNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const onPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const dayNames = language === 'ur'
        ? ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getEventsForDay = (day) => {
        return events.filter(event => isSameDay(new Date(event.date), day));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-fade-in">
            {/* Calendar Header */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light">
                <Button variant="outline-primary" className="rounded-circle p-2" onClick={onPrevMonth}>
                    <HiOutlineChevronLeft size={20} />
                </Button>
                <h3 className="fw-bold mb-0 text-capitalize">
                    {currentDate.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <Button variant="outline-primary" className="rounded-circle p-2" onClick={onNextMonth}>
                    <HiOutlineChevronRight size={20} />
                </Button>
            </div>

            {/* Day Names Row */}
            <div className="calendar-grid p-0 bg-light border-bottom">
                {dayNames.map(day => (
                    <div key={day} className="text-center py-2 fw-bold text-muted small border-start">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="calendar-grid">
                {calendarDays.map((day, idx) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={idx}
                            className={`calendar-day p-2 border-start border-bottom position-relative ${!isCurrentMonth ? 'bg-light opacity-50' : 'bg-white'}`}
                            style={{ minHeight: '120px' }}
                        >
                            <span className={`day-number fw-semibold px-2 py-1 rounded-circle mb-2 d-inline-block ${isToday ? 'bg-primary text-white shadow-sm' : 'text-dark'}`}>
                                {format(day, 'd')}
                            </span>

                            <div className="d-flex flex-column gap-1 overflow-hidden">
                                {dayEvents.map(event => (
                                    <OverlayTrigger
                                        key={event._id}
                                        trigger={['hover', 'focus']}
                                        placement="top"
                                        overlay={
                                            <Popover id={`popover-${event._id}`} className="shadow-lg border-0 rounded-lg">
                                                <Popover.Header className="bg-primary text-white fw-bold border-0 py-2">
                                                    {event.title}
                                                </Popover.Header>
                                                <Popover.Body className="p-3">
                                                    <p className="small text-muted mb-2 text-start line-clamp-2">{event.description}</p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="fw-bold text-primary small">Rs. {event.ticketPrice}</span>
                                                        <Link to={`/events/${event._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                                            {t('details')}
                                                        </Link>
                                                    </div>
                                                </Popover.Body>
                                            </Popover>
                                        }
                                    >
                                        <div className="event-pill text-truncate px-2 py-1 rounded-sm small bg-primary-light text-primary fw-medium cursor-pointer transition-all">
                                            {event.title}
                                        </div>
                                    </OverlayTrigger>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                }
                .calendar-day {
                    transition: background-color 0.2s ease;
                }
                .calendar-day:hover {
                    background-color: #fbfcfe;
                }
                .bg-primary-light {
                    background-color: rgba(13, 110, 253, 0.1);
                }
                .event-pill:hover {
                    background-color: rgba(13, 110, 253, 0.2);
                    transform: translateX(2px);
                }
                .rounded-sm {
                    border-radius: 4px;
                }
                .w-fit-content {
                    width: fit-content;
                }
            `}</style>
        </div>
    );
};

export default CalendarView;
