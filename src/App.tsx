import { RefObject, useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import Countdown from './components/Countdown';
import Footer from './components/Footer';
import ReminderComponent from './components/Reminder';
import Stopwatch from './components/Stopwatch';
import WorldClock from './components/WorldClock';
import { NotificationSchedulerProvider } from './components/notifications/NotificationSchedulerProvider';
import './css/App.css';
import { useClickOutside } from './hooks/useOutsideClick';
import { defaultAppSounds } from './lib/constants';
import PWABadge from './pwa/PWABadge';

function App() {
    const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
    ).matches;

    const [darkMode, setDarkMode] = useState<boolean>(() =>
        localStorage.getItem('themePreference')
            ? localStorage.getItem('themePreference') === 'dark'
            : prefersDark,
    );
    const [showSoundControls, setShowSoundControls] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedSound, setSelectedSound] = useState<string>(() =>
        localStorage.getItem('selectedSound')
            ? localStorage.getItem('selectedSound')!
            : defaultAppSounds[0].url,
    );
    const [volume, setVolume] = useState<number>(() =>
        localStorage.getItem('volume')
            ? parseFloat(localStorage.getItem('volume')!)
            : 0.5,
    );

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useClickOutside<HTMLDivElement>({
        open: showSoundControls,
        close: () => setShowSoundControls(false),
        triggerRef: triggerRef as RefObject<HTMLButtonElement>,
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio(selectedSound);
        audioRef.current.volume = volume;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [selectedSound, volume]);

    // Update volume when changed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);
    // Check for saved preferences
    useEffect(() => {
        // Theme preference
        const savedTheme = localStorage.getItem('themePreference');

        if (savedTheme === 'light') {
            setDarkMode(false);
        } else if (savedTheme === 'dark') {
            setDarkMode(true);
        } else {
            setDarkMode(prefersDark);
        }

        // Sound preferences
        const savedVolume = localStorage.getItem('volume');
        const savedSound = localStorage.getItem('selectedSound');

        if (savedVolume) {
            setVolume(parseFloat(savedVolume));
        }

        if (savedSound) {
            setSelectedSound(savedSound);
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('themePreference')) {
                setDarkMode(e.matches);
            }
        };
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [prefersDark]);

    // Apply theme and save preferences
    useEffect(() => {
        document.documentElement.setAttribute(
            'data-theme',
            darkMode ? 'dark' : 'light',
        );
        localStorage.setItem('themePreference', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Save sound preferences
    useEffect(() => {
        localStorage.setItem('volume', volume.toString());
        localStorage.setItem('selectedSound', selectedSound);
    }, [volume, selectedSound]);

    const toggleTheme = () => {
        setDarkMode((prev) => !prev);
    };

    const toggleSoundControls = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowSoundControls(!showSoundControls);
    };

    // Get currentTime
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <main className="app">
                <button className="theme-toggle" onClick={toggleTheme}>
                    {darkMode ? '☀️' : '🌙'}
                </button>
                <button
                    ref={triggerRef}
                    aria-expanded={showSoundControls}
                    aria-controls="sound-controls"
                    className="theme-toggle"
                    onClick={toggleSoundControls}
                    style={{ right: '70px' }}
                >
                    🔊
                </button>
                {showSoundControls && (
                    <div
                        id="sound-controls"
                        ref={popupRef}
                        className="sound-controls"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing>
                    >
                        <h4>Sound Settings</h4>
                        <select
                            className="sound-select"
                            value={selectedSound}
                            onChange={(e) => {
                                setSelectedSound(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()} // Additional protection for select
                        >
                            {defaultAppSounds.map((sound) => (
                                <option key={sound.url} value={sound.url}>
                                    {sound.label}
                                </option>
                            ))}
                        </select>
                        <div className="volume-control">
                            <span>🔉</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) =>
                                    setVolume(parseFloat(e.target.value))
                                }
                            />
                            <span>🔊</span>
                        </div>
                    </div>
                )}

                <div className="visual-indicator">
                    Sound:{' '}
                    {
                        defaultAppSounds.find((s) => s.url === selectedSound)
                            ?.label
                    }{' '}
                    ({Math.round(volume * 100)}%)
                </div>
                <header className="header">
                    <img src="/favicon.svg" alt="Time Planner" />
                    <h1>Time Planner</h1>
                </header>
                <div className="app-wrapper">
                    <div className="local">
                        <WorldClock currentTime={currentTime} />
                    </div>
                    <div className="container">
                        <NotificationSchedulerProvider>
                            <ReminderComponent audioRef={audioRef} />
                        </NotificationSchedulerProvider>
                        <Stopwatch />
                        <Countdown audioRef={audioRef} />
                    </div>
                </div>
                <Toaster theme={`${darkMode ? 'dark' : 'light'}`} />
                <PWABadge />
            </main>
            <Footer />
        </>
    );
}

export default App;
