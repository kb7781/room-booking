'use client';

import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/lib/data';

const STORAGE_KEY = 'classroom_bookings';

export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setBookings(JSON.parse(stored));
            } catch (error) {
                console.error("Failed to parse bookings from LocalStorage", error);
            }
        }
    }, []);

    const saveBookings = useCallback((newBookings: Booking[]) => {
        setBookings(newBookings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookings));
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
        date: string,
        startTime: string,
        endTime: string,
        excludeBookingId?: string
    ) => {
        return bookings.some(b => {
            // Ignore the booking we're editing
            if (b.id === excludeBookingId) return false;

            // Must be same room and date to conflict
            if (b.room !== room || b.date !== date) return false;

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
