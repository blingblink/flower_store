import { useState, useEffect } from 'react'

export const useDebounce = (value, milliSeconds, callback = null) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        if (callback) {
            callback(debouncedValue);
        }
    }, [debouncedValue]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, milliSeconds);

        return () => {
            clearTimeout(handler);
        };
    }, [value, milliSeconds]);

    return debouncedValue;
};