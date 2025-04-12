import { useContext } from 'react';
import { NotificationSchedulerContext } from '../../context/notificationSchedulerContext';

export const useNotificationScheduler = () => {
    const context = useContext(NotificationSchedulerContext);
    if (!context) {
        throw new Error(
            'useNotificationScheduler must be used within a NotificationSchedulerProvider',
        );
    }
    return context;
};
