'use client';

import { useAuth } from '@/components/AuthProvider';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/dashboard/Navbar';
import { Loader2 } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import * as XLSX from 'xlsx';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const { bookings } = useBookings();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // The AuthProvider will redirect
    }

    const handleExport = () => {
        if (bookings.length === 0) {
            alert("No bookings to export.");
            return;
        }

        const exportData = bookings.map(b => ({
            'Block': b.block,
            'Room': b.room,
            'Name': b.name,
            'Department': b.department,
            'Start Date': b.date,
            'End Date': b.endDate || b.date,
            'Start Time': b.startTime,
            'End Time': b.endTime,
            'Purpose': b.purpose
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

        // Auto-size columns slightly
        const columnWidths = [
            { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
        ];
        worksheet['!cols'] = columnWidths;

        XLSX.writeFile(workbook, `Classroom_Bookings_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="flex-col flex-1 overflow-hidden">
                <Navbar onExport={handleExport} />
                <main className="flex-1 overflow-y-auto w-full p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
