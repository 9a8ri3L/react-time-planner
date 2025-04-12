import { createContext } from 'react';
import { type NotificationSchedulerContextType } from '../types';

export const NotificationSchedulerContext =
    createContext<NotificationSchedulerContextType | null>(null);
