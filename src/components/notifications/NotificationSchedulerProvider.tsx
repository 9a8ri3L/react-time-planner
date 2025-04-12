import { useCallback } from 'react';
import NotificationScheduler from './NotificationScheduler';
import { NotificationSchedulerContext } from '../../context/notificationSchedulerContext';
import { ScheduledNotification, type RFC } from '../../types';

export const NotificationSchedulerProvider: RFC = ({ children }) => {
    const { scheduleNotification, cancelNotification } =
        NotificationScheduler();

    const handleScheduleNotification = useCallback(
        ({
            targetTime,
            options,
            audioRef,
            onTrigger,
            reminderId,
        }: Omit<ScheduledNotification, 'id'>) => {
            return scheduleNotification({
                targetTime,
                options,
                audioRef,
                onTrigger,
                reminderId,
            });
        },
        [scheduleNotification],
    );

    const handleCancelNotification = useCallback(
        (id: string) => {
            cancelNotification(id);
        },
        [cancelNotification],
    );

    return (
        <NotificationSchedulerContext.Provider
            value={{
                scheduleNotification: handleScheduleNotification,
                cancelNotification: handleCancelNotification,
            }}
        >
            {children}
        </NotificationSchedulerContext.Provider>
    );
};
