'use client';

import { useBookings } from '@/hooks/useBookings';
import { useClassrooms } from '@/hooks/useClassrooms';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Building2, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function Dashboard() {
    const { bookings } = useBookings();
    const { classrooms } = useClassrooms();

    const totalClassrooms = classrooms.length;
    const totalBookings = bookings.length;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayBookings = bookings.filter(b => todayStr >= b.date && todayStr <= (b.endDate || b.date));

    const stats = [
        { name: 'Total Classrooms', value: totalClassrooms, icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { name: 'Total Bookings', value: totalBookings, icon: CalendarIcon, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
        { name: 'Today\'s Activity', value: todayBookings.length, icon: Clock, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Welcome Back, Admin
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Here is what&apos;s happening across campus today.
                    </p>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-shadow"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[500px]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today&apos;s Schedule</h2>
                        <Link href="/dashboard/calendar" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            View Calendar &rarr;
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        <AnimatePresence>
                            {todayBookings.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                    <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                                    <p>No bookings scheduled for today.</p>
                                </div>
                            ) : (
                                todayBookings
                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                    .map((booking, i) => (
                                        <motion.div
                                            key={booking.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
                                        >
                                            <div className="flex flex-col items-center justify-center min-w-[70px] text-center border-r border-gray-200 dark:border-gray-700 pr-4">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{booking.startTime}</span>
                                                <span className="text-xs text-gray-500">{booking.endTime}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{booking.purpose}</h4>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                        {booking.room}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{booking.name} &middot; {booking.department}</p>
                                            </div>
                                        </motion.div>
                                    ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white flex flex-col justify-between"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Need a classroom fast?</h2>
                        <p className="text-blue-100 mb-8 max-w-sm">
                            Check real-time availability using the visual map and secure a room instantly.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/dashboard/blocks"
                            className="group inline-flex items-center justify-between w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm"
                        >
                            <div className="flex items-center">
                                <Building2 className="w-5 h-5 mr-3 text-blue-200" />
                                <span className="font-medium">Browse Blocks Map</span>
                            </div>
                            <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
                        </Link>

                        <Link
                            href="/dashboard/analytics"
                            className="group inline-flex items-center justify-between w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm"
                        >
                            <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-3 text-blue-200" />
                                <span className="font-medium">View Usage Analytics</span>
                            </div>
                            <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
