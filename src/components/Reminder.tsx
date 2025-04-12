import { formatDistanceToNowStrict } from 'date-fns';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { useClickOutside } from '../hooks/useOutsideClick';
import { Reminder, ReminderFC } from '../types';
import '../css/Reminder.css';
import { useNotificationScheduler } from './notifications/useNotificationScheduler';
import { toast } from 'sonner';

const ReminderComponent: React.FC<ReminderFC> = ({ audioRef }) => {
    const savedReminders = localStorage.getItem('reminders');

    // State
    const [reminders, setReminders] = useState<Reminder[]>(() => {
        if (typeof savedReminders === 'string') {
            const parsedReminders = JSON.parse(savedReminders) as Reminder[];
            const reParseDatetime = parsedReminders.map(
                (reminder: Reminder) => ({
                    ...reminder,
                    datetime: new Date(reminder.datetime),
                }),
            );
            return reParseDatetime;
        }
        return [];
    });
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isMobile, setIsMobile] = useState(false);
    const [permission, setPermission] =
        useState<NotificationPermission>('default');

    // Refs
    const triggerRef = useRef<HTMLButtonElement>(null);
    const modalRef = useClickOutside<HTMLDivElement>({
        open: isModalOpen,
        close: () => setIsModalOpen(false),
        triggerRef: triggerRef as RefObject<HTMLButtonElement>,
    });

    // Save reminders to localStorage
    useEffect(() => {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, [isMobile]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission()
                .then((perm) => {
                    setPermission(perm);
                    if (perm !== 'granted') {
                        toast('Warning...', {
                            description:
                                'Please allow notifications, otherwise, you will not be able to use reminders.',
                            duration: 5000,
                            icon: '⚠️',
                            closeButton: true,
                            position: 'top-right',
                        });
                    }
                })
                .catch((error: typeof errors) => {
                    setErrors(error);
                });
        } else {
            toast('Error:', {
                description:
                    'This browser does not support desktop notification',
                duration: 5000,
                icon: '🛑',
                closeButton: true,
                position: 'top-right',
            });
        }
    }, []);

    const { scheduleNotification, cancelNotification } =
        useNotificationScheduler();

    // rAF
    useEffect(() => {
        let notificationId: ReturnType<typeof scheduleNotification>;
        let mobileNotificationTimer: NodeJS.Timeout;
        let mobileNotificationTroggerTimer: NodeJS.Timeout;
        reminders.map((reminder) => {
            const options = {
                title: reminder.title,
                body: reminder.description,
                icon: '/clock.svg',
            };

            const notified = reminder.datetime.getTime() <= Date.now();
            if (isMobile) {
                if (permission && !notified) {
                    const mobileTimeout =
                        reminder.datetime.getTime() - Date.now();
                    mobileNotificationTimer = setTimeout(() => {
                        if (audioRef?.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current
                                .play()
                                .catch((e) =>
                                    console.error('Audio playback failed:', e),
                                );
                        }
                        const triggeredNotification = new Notification(
                            reminder.title,
                            options,
                        );
                        mobileNotificationTroggerTimer = setTimeout(
                            () => triggeredNotification.close(),
                            mobileTimeout + 30000,
                        );
                    }, mobileTimeout);
                }
                // For true background notifications
                if (navigator.serviceWorker) {
                    navigator.serviceWorker.controller?.postMessage({
                        type: 'SCHEDULE_BACKGROUND',
                        time: reminder.datetime.getTime(),
                        options,
                    });
                }
            } else {
                notificationId = notified
                    ? ''
                    : scheduleNotification({
                          targetTime: reminder.datetime,
                          options,
                          audioRef,
                          reminderId: reminder.id,
                          onTrigger: () => {
                              console.debug(
                                  `Debugger: ${reminder.title} has been triggered!`,
                              );
                          },
                      });
            }
        });

        return () => {
            // Clean up if component unmounts
            cancelNotification(notificationId);
            if (mobileNotificationTimer) {
                clearTimeout(mobileNotificationTimer);
            }
            if (mobileNotificationTroggerTimer) {
                clearTimeout(mobileNotificationTroggerTimer);
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reminders]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!date) {
            newErrors.date = 'Date is required';
            isValid = false;
        }

        if (!time) {
            newErrors.time = 'Time is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Use picker inputs
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        const reminderDate = new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            0,
            0,
        );
        const reminderTime = time;

        const newReminder: Reminder = {
            id: editingId || Date.now().toString(),
            title,
            description,
            date,
            time: reminderTime,
            datetime: reminderDate,
        };

        if (editingId) {
            setReminders((prev) =>
                prev.map((r) => (r.id === editingId ? newReminder : r)),
            );
        } else {
            setReminders((prev) => [...prev, newReminder]);
        }
        closeModal();
    };

    const openModal = (reminder?: Reminder) => {
        if (reminder) {
            setTitle(reminder.title);
            setDescription(reminder.description);
            setDate(reminder.date);
            setTime(reminder.time);
            setEditingId(reminder.id);
        } else {
            resetForm();
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
    };

    const deleteReminder = (id: string) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    const formatDateTime = (date: Date): string => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTimeRemaining = (date: Date) => {
        return formatDistanceToNowStrict(date, {
            addSuffix: true,
            roundingMethod: 'round',
        });
    };

    return (
        <div className="reminder-container">
            <div className="reminder-header">
                <h2>Reminders</h2>
                <button
                    ref={triggerRef}
                    className="add-reminder-btn"
                    onClick={() => openModal()}
                >
                    🔔 Add Reminder
                </button>
            </div>

            {reminders.length === 0 ? (
                <div className="no-reminders">
                    <p>No reminders set</p>
                </div>
            ) : (
                <div className="reminders-list">
                    {reminders
                        .sort(
                            (a, b) =>
                                a.datetime.getTime() - b.datetime.getTime(),
                        )
                        .map((reminder) => (
                            <div
                                style={{
                                    borderLeft: `4px solid ${reminder.datetime.getTime() < Date.now() ? 'var(--success-color)' : 'var(--expired-color)'}`,
                                }}
                                key={reminder.id}
                                className="reminder-card"
                            >
                                <div className="reminder-content">
                                    <div className="reminder-main">
                                        <h3>{reminder.title || 'Untitled'}</h3>
                                        <p className="reminder-description">
                                            {reminder.description}
                                        </p>
                                    </div>
                                    <div className="reminder-details">
                                        <p className="reminder-time">
                                            {formatDateTime(reminder.datetime)}
                                        </p>
                                        <p className="reminder-countdown">
                                            {formatTimeRemaining(
                                                reminder.datetime,
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="reminder-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => openModal(reminder)}
                                        ref={triggerRef}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() =>
                                            deleteReminder(reminder.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal" ref={modalRef}>
                        <h2>
                            {editingId ? 'Edit Reminder' : 'Add New Reminder'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title (optional)</label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Reminder title"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">
                                    Description (optional)
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Reminder description"
                                    rows={3}
                                />
                            </div>

                            <>
                                <div className="form-group">
                                    <label htmlFor="date">Date</label>
                                    <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) =>
                                            setDate(e.target.value)
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                    />
                                    {errors.date && (
                                        <span className="error">
                                            {errors.date}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="time">Time</label>
                                    <input
                                        id="time"
                                        type="time"
                                        value={time}
                                        onChange={(e) =>
                                            setTime(e.target.value)
                                        }
                                    />
                                    {errors.time && (
                                        <span className="error">
                                            {errors.time}
                                        </span>
                                    )}
                                </div>
                            </>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    {editingId ? 'Update' : 'Add'} Reminder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderComponent;
