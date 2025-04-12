import React, { useEffect, useState } from 'react';
import useIPLocation from '../hooks/useIPLocation';
import { City, ClockConfig, WorldClockInterface } from '../types';
import { fetchCities, formatLocalTime } from '../utils/clockUtils';
import Clock from './Clock';

const WorldClock: React.FC<WorldClockInterface> = ({ currentTime }) => {
    const savedConfig = JSON.parse(
        localStorage.getItem('clockConfig') as string,
    ) as ClockConfig;
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCities, setSelectedCities] = useState<City[]>(
        savedConfig ? savedConfig.selectedCities : [],
    );
    const [is24Hour, setIs24Hour] = useState<boolean>(
        savedConfig ? savedConfig.is24Hour : true,
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { city, country, timezone, loaded, error } = useIPLocation();

    const handleAddCity = (cityId: string) => {
        if (selectedCities.length >= 6) return;

        const cityToAdd = cities.find((c) => c.id === cityId);
        if (cityToAdd && !selectedCities.some((c) => c.id === cityId)) {
            setSelectedCities([...selectedCities, cityToAdd]);
        }
    };

    const handleRemoveCity = (cityId: string) => {
        setSelectedCities(selectedCities.filter((c) => c.id !== cityId));
    };

    const toggleTimeFormat = () => {
        setIs24Hour(!is24Hour);
    };

    const { date: localDate } = formatLocalTime(currentTime, is24Hour);

    // Initialize clock and fetch cities
    useEffect(() => {
        const loadCities = async () => {
            const availableCities = await fetchCities();
            setCities(availableCities);
            setIsLoading(false);
        };

        loadCities().catch(() => {
            console.error('Failed to get cities.');
        });
    }, []);

    // Save preferences
    useEffect(() => {
        const config: ClockConfig = {
            is24Hour,
            selectedCities,
        };
        localStorage.setItem('clockConfig', JSON.stringify(config));
    }, [is24Hour, selectedCities]);

    return (
        <div className="world-clock">
            <div className="local-time">
                <h2>Local Time</h2>
                {error && (
                    <div className="location-error">
                        <p>⚠️ Could not determine your location</p>
                        <p>
                            <small>{error}</small>
                        </p>
                    </div>
                )}
                {loaded ? (
                    <div className="location-details">
                        <p>
                            {!error && (
                                <strong>
                                    {city}, {country}
                                </strong>
                            )}
                            <br />
                            <span className="timezone">{timezone}</span>
                        </p>
                    </div>
                ) : (
                    <div className="location-loading">
                        <div className="spinner"></div>
                        <p>Detecting your location...</p>
                    </div>
                )}
                <div className="date">{localDate}</div>
                <Clock time={currentTime} />
            </div>

            <div className="world-clocks">
                <h3>World Clocks</h3>

                {isLoading ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '8px',
                        }}
                    >
                        Loading cities...
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {selectedCities.length > 0 && (
                            <button
                                onClick={toggleTimeFormat}
                                className="format-toggle"
                            >
                                Switch to {is24Hour ? '12-hour' : '24-hour'}{' '}
                                format
                            </button>
                        )}
                        <div className="city-selector">
                            <select
                                onChange={(e) => handleAddCity(e.target.value)}
                                disabled={selectedCities.length >= 6}
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select a city
                                </option>
                                {cities.map((city) => (
                                    <option
                                        key={city.id}
                                        value={city.id}
                                        disabled={selectedCities.some(
                                            (c) => c.id === city.id,
                                        )}
                                    >
                                        {city.name}, {city.country}
                                    </option>
                                ))}
                            </select>
                            <span className="selection-count">
                                {selectedCities.length} of 6 selected
                            </span>
                        </div>

                        <div className="city-clocks">
                            {selectedCities.map((city) => {
                                const { time } = formatLocalTime(
                                    currentTime,
                                    is24Hour,
                                    city.timezone,
                                );
                                return (
                                    <div key={city.id} className="city-clock">
                                        <div className="city-info">
                                            <button
                                                title="Remove city from list"
                                                onClick={() =>
                                                    handleRemoveCity(city.id)
                                                }
                                                className="remove-btn"
                                            >
                                                ❌
                                            </button>
                                            <span className="city-name">
                                                {city.name}
                                            </span>
                                            <span className="country">
                                                {city.country}
                                            </span>
                                        </div>
                                        <div className="city-time">{time}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WorldClock;
