import { useEffect, useState } from 'react';
import { LocalConfig } from '../types';
import '../css/Clock.css';

const Clock = ({ time }: { time: Date }) => {
    const savedLocalConfig = JSON.parse(
        localStorage.getItem('localConfig') as string,
    ) as LocalConfig;

    const [isAnalog, setIsAnalog] = useState(
        savedLocalConfig ? savedLocalConfig.isAnalog : true,
    );

    const [is24Hour, setIs24Hour] = useState(
        savedLocalConfig ? savedLocalConfig.is24Hour : true,
    );

    // Toggle clock type
    const toggleClockType = () => {
        setIsAnalog((prev) => !prev);
    };

    // Toggle time format
    const toggleTimeFormat = () => {
        setIs24Hour(!is24Hour);
    };

    // Format time for digital display
    const formatTime = () => {
        let hours = time.getHours();
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const seconds = time.getSeconds().toString().padStart(2, '0');

        if (!is24Hour) {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes}:${seconds} ${ampm}`;
        }
        return `${hours}:${minutes}:${seconds}`;
    };

    // Calculate angles for analog clock hands
    const secondsAngle = time.getSeconds() * 6;
    const minutesAngle = time.getMinutes() * 6 + time.getSeconds() * 0.1;
    const hoursAngle = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;

    useEffect(() => {
        const config = {
            isAnalog,
            is24Hour,
        };
        localStorage.setItem('localConfig', JSON.stringify(config));
    }, [is24Hour, isAnalog]);

    return (
        <div className="clock-container">
            <div className="clock-controls">
                <button onClick={toggleClockType}>
                    {isAnalog ? 'Show Digital' : 'Show Analog'}
                </button>
                {!isAnalog && (
                    <button onClick={toggleTimeFormat}>
                        Switch to {is24Hour ? '12-hour' : '24-hour'} format
                    </button>
                )}
            </div>

            {isAnalog ? (
                <div
                    className="analog-clock"
                    data-after={`${new Date().getDate()}`}
                >
                    <div
                        className="clock-face"
                        data-before={new Date().getFullYear()}
                    >
                        {[...(Array(12) as undefined[])].map((_, i) => (
                            <div
                                key={i}
                                className="hour-mark"
                                style={{ transform: `rotate(${i * 30}deg)` }}
                            >
                                <div
                                    className="hour-number"
                                    style={{
                                        transform: `rotate(-${i * 30}deg)`,
                                        color: `${!(i % 3) && 'var(--expired-color)'}`,
                                    }}
                                >
                                    {i === 0
                                        ? 'Ⅻ'
                                        : i === 3
                                          ? 'Ⅲ'
                                          : i === 6
                                            ? 'Ⅵ'
                                            : i === 9
                                              ? 'Ⅸ'
                                              : i}
                                </div>
                            </div>
                        ))}
                        <div
                            className="hand hour-hand"
                            style={{ transform: `rotate(${hoursAngle}deg)` }}
                        />
                        <div
                            className="hand minute-hand"
                            style={{ transform: `rotate(${minutesAngle}deg)` }}
                        />
                        <div
                            className="hand second-hand"
                            style={{
                                transform: `rotate(${secondsAngle}deg)`,
                            }}
                        />
                        <div className="center-dot" />
                    </div>
                </div>
            ) : (
                <div className="digital-clock">{formatTime()}</div>
            )}
        </div>
    );
};

export default Clock;
