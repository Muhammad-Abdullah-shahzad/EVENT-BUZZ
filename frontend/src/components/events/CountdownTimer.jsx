import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, size = 'default' }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && interval !== 'seconds') {
            return;
        }

        const isSmall = size === 'sm';

        timerComponents.push(
            <div key={interval} className={`d-flex flex-column align-items-center bg-light rounded-xl ${isSmall ? 'p-1 px-2' : 'p-2 px-3'} shadow-sm`}>
                <span className={`fw-bold ${isSmall ? 'fs-6' : 'fs-4'} text-primary leading-tight`}>{timeLeft[interval]}</span>
                <span className="text-muted x-small text-uppercase fw-bold" style={{ fontSize: isSmall ? '0.5rem' : '0.65rem' }}>{interval.charAt(0)}</span>
            </div>
        );
    });

    return (
        <div className="d-flex gap-2 flex-wrap">
            {timerComponents.length ? timerComponents : <span className="text-danger fw-bold small">Event Started!</span>}
        </div>
    );
};

export default CountdownTimer;
