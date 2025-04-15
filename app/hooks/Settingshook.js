import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_V1_URL } from '../constant/API';

const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API_V1_URL}/api/v1/fetch-settings`);
                setSettings(response?.data?.settings);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
};

export default useSettings;