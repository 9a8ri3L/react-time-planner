import React, { useEffect, useState } from 'react';
import { StopwatchProps } from '../types';

const Stopwatch: React.FC<StopwatchProps> = ({ initialTime = 0 }) => {
    const [time, setTime] = useState<number>(initialTime);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [pausedTime, setPausedTime] = useState<number>(0);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isRunning) {
            intervalId = setInterval(() => {
                setTime(Date.now() - (startTime || 0) + pausedTime);
            }, 10);
        }

        return () => clearInterval(intervalId);
    }, [isRunning, startTime, pausedTime]);

    const start = () => {
        setIsRunning(true);
        setStartTime(Date.now());
    };

    const pause = () => {
        setIsRunning(false);
        setPausedTime(time);
    };

    const resume = () => {
        setIsRunning(true);
        setStartTime(Date.now());
    };

    const reset = () => {
        setIsRunning(false);
        setTime(initialTime);
        setPausedTime(initialTime);
        setStartTime(null);
    };

    const formatTime = (timeInMs: number): string => {
        const totalSeconds = Math.floor(timeInMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeInMs % 1000) / 10);

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(
                2,
                '0',
            )}:${seconds.toString().padStart(2, '0')}.${milliseconds
            .toString()
            .padStart(2, '0')}`;
    };

    return (
        <div className="timer-container">
            <h2>Stopwatch</h2>
            <div className="time-display">{formatTime(time)}</div>

            <div className="controls">
                {!isRunning ? (
                    time === initialTime ? (
                        <button className="btn start-btn" onClick={start}>
                            Start
                        </button>
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

                <button
                    className="btn reset-btn"
                    onClick={reset}
                    disabled={time === initialTime}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Stopwatch;
