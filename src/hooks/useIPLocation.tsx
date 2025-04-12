import axios, { AxiosResponse } from 'axios';
import { useState, useEffect } from 'react';

const useIPLocation = () => {
    const [location, setLocation] = useState({
        loaded: false,
        country: '',
        city: '',
        timezone: '',
        error: '',
    });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response: AxiosResponse<{
                    location: {
                        city: string;
                        country: string;
                        timezone: string;
                    };
                    status: string;
                    message: string;
                }> = await axios.get('https://api.ipapi.is/?whois=');
                const { data } = response;

                if (data.status === 'fail') throw new Error(data.message);
                if (data.location) {
                    setLocation({
                        loaded: true,
                        country: data.location.country,
                        city: data.location.city,
                        timezone: data.location.timezone,
                        error: '',
                    });
                }
            } catch (error) {
                if (error instanceof Error) {
                    setLocation((prev) => ({
                        ...prev,
                        loaded: true,
                        error: error.message,
                    }));
                }
            }
        };

        fetchLocation().catch((error: unknown) => {
            console.error('Failed to get local location.', error);
        });
    }, []);

    return location;
};

export default useIPLocation;
