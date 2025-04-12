import React, { useState, useEffect } from 'react';
import { CountdownProps } from '../types';

const Countdown: React.FC<CountdownProps> = ({ initialTime = 0, audioRef }) => {
    const [time, setTime] = useState<number>(initialTime);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [showVisualIndicator, setShowVisualIndicator] =
        useState<boolean>(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isRunning && time > 0) {
            intervalId = setInterval(() => {
                const remaining = (endTime || 0) - Date.now();
                setTime(remaining > 0 ? remaining : 0);
                if (remaining <= 0) {
                    setIsRunning(false);
                    // Play sound and show visual indicator
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current
                            .play()
                            .catch((e) =>
                                console.error('Audio playback failed:', e),
                            );
                    }
                    setShowVisualIndicator(true);
                    setTimeout(() => {
                        setShowVisualIndicator(false);
                    }, 5000);
                }
            }, 10);
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, endTime, time, audioRef]);

    const start = (duration: number) => {
        setTime(duration);
        setEndTime(Date.now() + duration);
        setIsRunning(true);
    };

    const pause = () => {
        setIsRunning(false);
    };

    const resume = () => {
        setEndTime(Date.now() + time);
        setIsRunning(true);
    };

    const reset = () => {
        setIsRunning(false);
        setTime(initialTime);
        setEndTime(null);
        setShowVisualIndicator(false);
    };

    const formatTime = (timeInMs: number): string => {
        const totalSeconds = Math.ceil(timeInMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const presetTimes = [
        { label: '1 sec', value: 1 * 1000 },
        { label: '5 secs', value: 5 * 1000 },
        { label: '10 secs', value: 10 * 1000 },
        { label: '15 secs', value: 15 * 1000 },
        { label: '30 secs', value: 30 * 1000 },
        { label: '45 secs', value: 45 * 1000 },
        { label: '1 min', value: 60 * 1000 },
        { label: '2 mins', value: 2 * 60 * 1000 },
        { label: '3 mins', value: 3 * 60 * 1000 },
        { label: '5 mins', value: 5 * 60 * 1000 },
        { label: '10 mins', value: 10 * 60 * 1000 },
        { label: '15 mins', value: 15 * 60 * 1000 },
        { label: '30 mins', value: 30 * 60 * 1000 },
        { label: '45 mins', value: 45 * 60 * 1000 },
        { label: '1 hour', value: 60 * 60 * 1000 },
        { label: '2 hours', value: 2 * 60 * 60 * 1000 },
        { label: '3 hours', value: 3 * 60 * 60 * 1000 },
        { label: '5 hours', value: 5 * 60 * 60 * 1000 },
        { label: '7 hours', value: 7 * 60 * 60 * 1000 },
        { label: '10 hours', value: 10 * 60 * 60 * 1000 },
        { label: '16 hours', value: 16 * 60 * 60 * 1000 },
        { label: '20 hours', value: 20 * 60 * 60 * 1000 },
        { label: '1 day', value: 24 * 60 * 60 * 1000 },
    ];

    return (
        <div className="timer-container">
            <h2>Countdown</h2>
            <div
                className={`time-display ${time <= 10000 && time > 0 ? 'warning' : ''} ${time === 0 ? 'expired' : ''}`}
            >
                {formatTime(time)}
            </div>
            {showVisualIndicator && (
                <div className="countdown-visual-indicator visible">
                    Countdown Complete! ⏰
                </div>
            )}

            <div className="controls">
                {!isRunning ? (
                    time === initialTime ? (
                        <div className="presets">
                            <h3>Quick Start</h3>
                            <div className="preset-buttons">
                                {presetTimes.map((preset) => (
                                    <button
                                        title={`Start countdown from ${preset.label}`}
                                        key={preset.value}
                                        className="btn preset-btn"
                                        onClick={() => start(preset.value)}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <button className="btn resume-btn" onClick={resume}>
                            Resume
                        </button>
                    )
                ) : (
                    <button className="btn pause-btn" onClick={pause}>
                        Pause
                    </button>
                )}

                {isRunning && (
                    <button
                        className="btn reset-btn"
                        onClick={reset}
                        disabled={time === initialTime}
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
};

export default Countdown;
