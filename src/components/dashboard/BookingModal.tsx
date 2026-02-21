'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    block: string;
    room: string;
    defaultDate: string;
}

export function BookingModal({ isOpen, onClose, block, room, defaultDate }: BookingModalProps) {
    const { addBooking, checkConflict, bookings } = useBookings();

    const [formData, setFormData] = useState({
        name: '',
        department: '',
        date: defaultDate,
        startTime: '10:00',
        endTime: '11:00',
        purpose: ''
    });

    const [error, setError] = useState<string | null>(null);

    // Reset form when opened for a new room/day
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, date: defaultDate }));
            setError(null);
        }
    }, [isOpen, defaultDate]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate times
        if (formData.startTime >= formData.endTime) {
            setError("End time must be after start time");
            return;
        }

        // Check conflict
        const hasConflict = checkConflict(room, formData.date, formData.startTime, formData.endTime);
        if (hasConflict) {
            setError("Time conflict detected! This room is already booked during this time period on the selected date.");
            return;
        }

        addBooking({
            block,
            room,
            ...formData
        });

        onClose();
    };

    const roomBookingsToday = bookings.filter(b => b.room === room && b.date === formData.date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Book Room {room}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{block}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:flex gap-8">
                        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requester Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData(f => ({ ...f, department: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Computer Science"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData(f => ({ ...f, startTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData(f => ({ ...f, endTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose / Details</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.purpose}
                                    onChange={(e) => setFormData(f => ({ ...f, purpose: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Weekly review meeting..."
                                />
                            </div>

                            {error && (
                                <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>

                        {/* Sidebar showing current bookings for the selected date */}
                        <div className="hidden md:block w-64 border-l border-gray-200 dark:border-gray-700 pl-6 mt-6 md:mt-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Bookings on {formData.date}</h3>
                            {roomBookingsToday.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No bookings for this date across this room yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {roomBookingsToday.map((b) => (
                                        <div key={b.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                                            <div className="font-medium text-gray-900 dark:text-white">{b.startTime} - {b.endTime}</div>
                                            <div className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{b.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
