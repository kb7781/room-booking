'use client';

import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/lib/data';

const STORAGE_KEY = 'classroom_bookings';

export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);

    // Load from local storage on mount and listen to changes
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setBookings(JSON.parse(stored));
                } catch (error) {
                    console.error("Failed to parse bookings from LocalStorage", error);
                }
            }
        };

        handleStorageChange();

        // Listen for standard cross-tab storage changes and custom intra-tab sync events
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-sync-bookings', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-sync-bookings', handleStorageChange);
        };
    }, []);

    const saveBookings = useCallback((newBookings: Booking[]) => {
        setBookings(newBookings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookings));
        // Dispatch custom event to sync other components using this hook in the same tab
        window.dispatchEvent(new Event('local-storage-sync-bookings'));
    }, []);

    const addBooking = useCallback((booking: Omit<Booking, 'id'>) => {
        const newBooking = { ...booking, id: crypto.randomUUID() };
        saveBookings([...bookings, newBooking]);
        return newBooking;
    }, [bookings, saveBookings]);

    const removeBooking = useCallback((id: string) => {
        saveBookings(bookings.filter(b => b.id !== id));
    }, [bookings, saveBookings]);

    const updateBooking = useCallback((updatedBooking: Booking) => {
        saveBookings(bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    }, [bookings, saveBookings]);

    // Utility to check time conflicts
    const checkConflict = useCallback((
        room: string,
        startDate: string,
        endDate: string,
        startTime: string,
        endTime: string,
        excludeBookingId?: string
    ) => {
        return bookings.some(b => {
            // Ignore the booking we're editing
            if (b.id === excludeBookingId) return false;

            // Must be same room to conflict
            if (b.room !== room) return false;

            const bStart = b.date;
            const bEnd = b.endDate || b.date;

            // Check if date ranges overlap
            const dateOverlap = startDate <= bEnd && endDate >= bStart;
            if (!dateOverlap) return false;

            // Check time overlap
            // e.g. b=10:00-12:00, new=11:00-13:00 -> overlap
            // new.start < b.end AND new.end > b.start
            return startTime < b.endTime && endTime > b.startTime;
        });
    }, [bookings]);

    return {
        bookings,
        addBooking,
        removeBooking,
        updateBooking,
        checkConflict
    };
}
