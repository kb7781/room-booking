'use client';

import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
    const { bookings, removeBooking } = useBookings();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedDateBookings = bookings.filter(b => selectedDateStr >= b.date && selectedDateStr <= (b.endDate || b.date))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const getBookingsCountForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return bookings.filter(b => dateStr >= b.date && dateStr <= (b.endDate || b.date)).length;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <CalendarIcon className="mr-3 text-blue-500 h-6 w-6" />
                        Calendar View
                    </h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={previousMonth}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="bg-gray-50 dark:bg-gray-900 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}

                        {/* Blank spaces for first week padding */}
                        {Array.from({ length: days[0].getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-white dark:bg-gray-800 min-h-[100px]" />
                        ))}

                        {days.map((day) => {
                            const count = getBookingsCountForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "bg-white dark:bg-gray-800 min-h-[100px] p-2 flex flex-col items-start transition-all relative hover:bg-gray-50 dark:hover:bg-gray-750",
                                        isSelected && "ring-2 ring-inset ring-blue-500 z-10"
                                    )}
                                >
                                    <span className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
                                        isToday ? "bg-blue-600 text-white" : "text-gray-900 dark:text-gray-100",
                                        isSelected && !isToday && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                    )}>
                                        {format(day, 'd')}
                                    </span>

                                    {count > 0 && (
                                        <div className="mt-auto w-full">
                                            <div className="w-full flex items-center justify-between px-1.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-400 font-medium">
                                                <span>{count} booking{count !== 1 ? 's' : ''}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[calc(100vh-8rem)] sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''} scheduled
                </p>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
                    <AnimatePresence mode="popLayout">
                        {selectedDateBookings.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
                            >
                                <CalendarIcon className="h-12 w-12 mb-3 opacity-20" />
                                <p>No commitments today.</p>
                                <p className="text-sm mt-1">Enjoy the free space!</p>
                            </motion.div>
                        ) : (
                            selectedDateBookings.map((booking, i) => (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 mb-2">
                                                {booking.block} - {booking.room}
                                            </span>
                                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{booking.purpose}</h4>
                                        </div>
                                        <button
                                            onClick={() => removeBooking(booking.id)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 mt-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                            title="Delete booking"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        {booking.startTime} - {booking.endTime}
                                    </div>

                                    <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-900 dark:text-gray-200">{booking.name}</span>
                                        <span className="text-gray-500">{booking.department}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
