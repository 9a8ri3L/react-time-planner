import axios from 'axios';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { City } from '../types';

const fallbackTimezoneConvert = (date: Date, timezone: string) => {
    try {
        return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    } catch {
        return date; // Fallback to local time
    }
};
export const formatLocalTime = (
    date: Date,
    is24Hour: boolean,
    timezone?: string,
) => {
    const targetDate = timezone
        ? fallbackTimezoneConvert(date, timezone)
        : date;

    const timeFormat = is24Hour ? 'HH:mm:ss' : 'h:mm:ss a';
    const dateFormat = 'EEEE, d MMMM yyyy';

    return {
        date: format(targetDate, dateFormat, { locale: enUS }),
        time: format(targetDate, timeFormat, { locale: enUS }),
    };
};

export const fetchCities = async (): Promise<City[]> => {
    try {
        const response = await axios.get(
            'https://timeapi.io/api/timezone/availabletimezones',
        );
        return (response.data as string[]).map((tz: string) => {
            const [area, location] = tz.split('/');
            return {
                id: tz,
                name: location?.replace(/_/g, ' ') || '',
                timezone: tz,
                country: area,
            };
        });
    } catch (error) {
        console.error('Failed to fetch cities:', error);
        // Fallback data
        return [
            {
                id: 'Europe/London',
                name: 'London',
                timezone: 'Europe/London',
                country: 'Europe',
            },
            {
                id: 'America/New_York',
                name: 'New York',
                timezone: 'America/New_York',
                country: 'America',
            },
            {
                id: 'Asia/Tokyo',
                name: 'Tokyo',
                timezone: 'Asia/Tokyo',
                country: 'Asia',
            },
            {
                id: 'Africa/Cairo',
                name: 'Cairo',
                timezone: 'Africa/Cairo',
                country: 'Egypt',
            },
        ];
    }
};

export async function getCurrentLocation(ip?: string) {
    try {
        const response = await axios.get(
            `https://timeapi.io/api/time/current/ip?ipAddress=${ip}`,
        );
        return response.data as Record<PropertyKey, string>;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
    }
}
