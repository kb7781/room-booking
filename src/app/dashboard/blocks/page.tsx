'use client';

import { useBookings } from '@/hooks/useBookings';
import { useClassrooms } from '@/hooks/useClassrooms';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { BookingModal } from '@/components/dashboard/BookingModal';

export default function BlocksPage() {
    const { bookings } = useBookings();
    const { classrooms } = useClassrooms();
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        // Default to today
        const now = new Date();
        return now.toISOString().split('T')[0];
    });

    const [selectedRoom, setSelectedRoom] = useState<{ block: string, room: string } | null>(null);

    const getRoomStatus = (room: string, date: string) => {
        const roomBookings = bookings.filter(b => b.room === room && date >= b.date && date <= (b.endDate || b.date));

        if (roomBookings.length === 0) return 'available';

        // Calculate total booked hours vs assumed 10 hour day (8 AM to 6 PM)
        // For simplicity, any booking makes it 'partially', multiple overlapping all day makes it 'fully'
        // Let's use a simpler heuristic: >= 4 hours booked = fully booked, else partially booked
        let totalMinutesBooked = 0;
        roomBookings.forEach(b => {
            const [sH, sM] = b.startTime.split(':').map(Number);
            const [eH, eM] = b.endTime.split(':').map(Number);
            totalMinutesBooked += (eH * 60 + eM) - (sH * 60 + sM);
        });

        // 4 hours = 240 mins
        if (totalMinutesBooked >= 240) return 'fully_booked';
        return 'partially_booked';
    };

    const getStatusColor = (status: ReturnType<typeof getRoomStatus>) => {
        switch (status) {
            case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50';
            case 'partially_booked': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50';
            case 'fully_booked': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50';
        }
    };

    const getStatusPulseColor = (status: ReturnType<typeof getRoomStatus>) => {
        switch (status) {
            case 'available': return 'bg-emerald-500';
            case 'partially_booked': return 'bg-amber-500';
            case 'fully_booked': return 'bg-rose-500';
        }
    };

    const blocksData = classrooms.reduce((acc, c) => {
        if (!acc[c.block]) acc[c.block] = [];
        acc[c.block].push(c);
        return acc;
    }, {} as Record<string, typeof classrooms>);

    const blocks = Object.entries(blocksData).sort((a, b) => a[0].localeCompare(b[0]));

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Blocks</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Select a map to view its classrooms and book spaces.</p>
                </div>

                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <label htmlFor="date-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">Viewing Date:</label>
                    <input
                        id="date-select"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="ml-2 border-0 bg-gray-50 dark:bg-gray-900 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:[color-scheme:dark]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blocks.map(([blockName, rooms]) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                        key={blockName}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                <Building2Icon className="h-5 w-5 mr-2 text-blue-500" />
                                {blockName}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {rooms.map((roomObj) => {
                                    const room = roomObj.room;
                                    const status = getRoomStatus(room, selectedDate);

                                    return (
                                        <motion.button
                                            layout
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedRoom({ block: blockName, room })}
                                            key={roomObj.id}
                                            className={cn(
                                                "relative flex flex-col items-start p-4 rounded-xl border transition-all text-left",
                                                getStatusColor(status)
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full mb-2">
                                                <span className="font-bold text-lg">{room}</span>
                                                <div className="flex items-center space-x-1">
                                                    <span className={cn("w-2.5 h-2.5 rounded-full animate-pulse", getStatusPulseColor(status))} />
                                                </div>
                                            </div>

                                            <div className="flex items-center text-xs opacity-80 mt-auto">
                                                <Users className="w-3.5 h-3.5 mr-1" />
                                                {roomObj.capacity} Cap
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>

            {selectedRoom && (
                <BookingModal
                    isOpen={!!selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                    block={selectedRoom.block}
                    room={selectedRoom.room}
                    defaultDate={selectedDate}
                />
            )}
        </div>
    );
}

// Simple internal icon so we don't need too many imports above
function Building2Icon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    );
}
