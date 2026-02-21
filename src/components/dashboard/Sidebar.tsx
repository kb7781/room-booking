'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, BarChart3, Building2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Classrooms', href: '/dashboard/classrooms', icon: Settings },
    { name: 'Blocks', href: '/dashboard/blocks', icon: Building2 },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full">
            <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    UniBook Admin
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50',
                                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-blue-700 dark:text-blue-200' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500',
                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
