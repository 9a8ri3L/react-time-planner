import React from 'react';

interface AudioRef {
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

export type CountdownProps = {
    initialTime?: number;
} & AudioRef;

export interface StopwatchProps {
    initialTime?: number;
}

export interface City {
    id: string;
    name: string;
    timezone: string;
    country: string;
}

export interface ClockConfig {
    is24Hour: boolean;
    selectedCities: City[];
}

export interface WorldClockInterface {
    currentTime: Date;
}

export interface LocalConfig {
    is24Hour: boolean;
    isAnalog: boolean;
}

export type RFC = React.FC<{
    children: React.ReactNode;
}>;

export type NotificationSchedulerContextType = {
    scheduleNotification: ({
        audioRef,
        targetTime,
        options,
        onTrigger,
        reminderId,
    }: Omit<ScheduledNotification, 'id'>) => string;
    cancelNotification: (id: string) => void;
};

export type WorkerMessage = {
    type: 'SCHEDULE' | 'CANCEL';
    id: string;
    delay?: number;
};

export type NotificationOptions = {
    title: string;
    body: string;
    icon?: string;
};

export type ScheduledNotification = {
    id: string;
    targetTime: Date;
    options: NotificationOptions;
    onTrigger?: () => void;
    reminderId: string;
} & AudioRef;

export type Reminder = {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    datetime: Date;
};

export type ReminderFC = {} & AudioRef;
