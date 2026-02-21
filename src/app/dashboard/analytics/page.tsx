'use client';

import { useBookings } from '@/hooks/useBookings';
import { useClassrooms } from '@/hooks/useClassrooms';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, Calendar as CalendarIcon, Building2, TrendingUp } from 'lucide-react';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

export default function AnalyticsPage() {
    const { bookings } = useBookings();
    const { classrooms } = useClassrooms();

    const totalClassrooms = classrooms.length;
    const totalBookings = bookings.length;

    // Most Booked Block
    const blockCounts = bookings.reduce((acc, b) => {
        acc[b.block] = (acc[b.block] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostBookedBlock = Object.entries(blockCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Most Booked Room
    const roomCounts = bookings.reduce((acc, b) => {
        acc[b.room] = (acc[b.room] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostBookedRoom = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Booking count per day chart data (last 7 days of bookings, or grouping by date)
    // To keep it simple, let's just show top 5 booked dates
    const dateCounts = bookings.reduce((acc, b) => {
        try {
            const daysSpan = eachDayOfInterval({
                start: parseISO(b.date),
                end: parseISO(b.endDate || b.date)
            });
            daysSpan.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                acc[dateStr] = (acc[dateStr] || 0) + 1;
            });
        } catch (e) {
            // fallback if parse fails
            acc[b.date] = (acc[b.date] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(dateCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7) // Show last 7 booked dates chronologically
        .map(([date, count]) => ({
            date: date.substring(5), // Just MM-DD
            count
        }));

    const stats = [
        { name: 'Total Classrooms', value: totalClassrooms, icon: Building2, color: 'bg-blue-500' },
        { name: 'Total Bookings', value: totalBookings, icon: CalendarIcon, color: 'bg-indigo-500' },
        { name: 'Most Booked Block', value: mostBookedBlock, icon: TrendingUp, color: 'bg-emerald-500' },
        { name: 'Most Popular Room', value: mostBookedRoom, icon: Users, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h1>
                <p className="text-gray-500 mt-1">Key metrics and statistics about classroom usage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 pt-8 max-w-4xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Booking Flow (Last Active Days)</h2>
                <div className="h-80">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                            No data available to chart yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
