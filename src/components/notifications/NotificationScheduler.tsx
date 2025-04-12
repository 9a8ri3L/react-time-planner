import { useCallback, useEffect, useRef, useState } from 'react';
import { ScheduledNotification } from '../../types';

function NotificationScheduler() {
    const [scheduledNotifications, setScheduledNotifications] = useState<
        ScheduledNotification[]
    >([]);
    const [permission, setPermission] =
        useState<NotificationPermission>('default');

    const animationFrameRef = useRef<number | null>(null);
    const workerRef = useRef<Worker | null>(null);

    const triggerNotification = useCallback(
        (id: string) => {
            setScheduledNotifications((prev) => {
                const notification = prev.find((n) => n.id === id);
                if (!notification) return prev;
                const { audioRef, targetTime, options, onTrigger } =
                    notification;
                const now = Date.now();
                const remainingTime = targetTime.getTime() - now;
                if (remainingTime > -500 && permission === 'granted') {
                    if (audioRef?.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current
                            .play()
                            .catch((e) =>
                                console.error('Audio playback failed:', e),
                            );
                    }
                    const triggeredNotification = new Notification(
                        options.title,
                        options,
                    );

                    // Close notification after 30 seconds
                    setTimeout(() => triggeredNotification.close(), 30000);
                } else {
                    console.warn('Notifications not allowed:', options);
                }

                onTrigger?.();
                return prev.filter((n) => n.id !== id);
            });
        },
        [permission],
    );

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission()
                .then((perm) => {
                    setPermission(perm);
                })
                .catch((error: unknown) => {
                    console.error(
                        'Error: Failed to request notification.',
                        error,
                    );
                });
        }

        // Set up Web Worker for more reliable timing
        if (window.Worker) {
            const worker = new Worker(
                new URL('./notificationWorker.ts', import.meta.url),
            );
            workerRef.current = worker;

            worker.onmessage = (
                e: MessageEvent<Record<PropertyKey, string>>,
            ) => {
                const { id } = e.data;

                triggerNotification(id);
            };

            return () => {
                worker.terminate();
            };
        }
    }, [triggerNotification]);

    // Schedule notifications using optimal timing strategy
    useEffect(() => {
        if (scheduledNotifications.length === 0) return;

        const checkNotifications = () => {
            const now = new Date();
            const upcomingNotifications = scheduledNotifications.filter(
                (notif) => notif.targetTime.getTime() - now.getTime() <= 30000,
            );

            upcomingNotifications.forEach((notif) => {
                const timeRemaining = notif.targetTime.getTime() - Date.now();

                if (timeRemaining <= 0) {
                    triggerNotification(notif.id);
                } else if (timeRemaining <= 30000) {
                    // Switch to precise timing when <30s remaining
                    if (workerRef.current) {
                        workerRef.current.postMessage({
                            type: 'SCHEDULE',
                            id: notif.id,
                            delay: timeRemaining,
                        });
                    } else {
                        // Fallback to setTimeout if Workers aren't supported
                        setTimeout(
                            () => triggerNotification(notif.id),
                            timeRemaining,
                        );
                    }
                }
            });

            animationFrameRef.current =
                requestAnimationFrame(checkNotifications);
        };

        animationFrameRef.current = requestAnimationFrame(checkNotifications);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [scheduledNotifications, triggerNotification]);

    const scheduleNotification = (
        scheduleNotification: Omit<ScheduledNotification, 'id'>,
    ): string => {
        const id = crypto.randomUUID();
        const { audioRef, targetTime, options, onTrigger, reminderId } =
            scheduleNotification;
        setScheduledNotifications((prev) => {
            const existingScheduleNotification = prev.find(
                (not) => not.reminderId === reminderId,
            );
            if (existingScheduleNotification) {
                existingScheduleNotification.audioRef = audioRef;
                existingScheduleNotification.targetTime = targetTime;
                existingScheduleNotification.options = options;
                existingScheduleNotification.onTrigger = onTrigger;
                return prev;
            }
            return [
                ...prev,
                {
                    id,
                    targetTime,
                    options,
                    onTrigger,
                    audioRef,
                    reminderId,
                },
            ];
        });

        return id;
    };

    const cancelNotification = (id: string) => {
        setScheduledNotifications((prev) => prev.filter((n) => n.id !== id));
        if (workerRef.current) {
            workerRef.current.postMessage({
                type: 'CANCEL',
                id,
            });
        }
    };

    return { scheduleNotification, cancelNotification };
}

export default NotificationScheduler;
