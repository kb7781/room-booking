'use client';

import { useAuth } from '@/components/AuthProvider';
import { Search, LogOut, Download, Moon, Sun, X, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar({ onExport }: { onExport?: () => void }) {
    const { logout } = useAuth();
    const { bookings } = useBookings();
    const [isDark, setIsDark] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.remove('dark');
            setIsDark(false);
        } else {
            root.classList.add('dark');
            setIsDark(true);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchRef.current?.querySelector('input')?.focus();
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredBookings = bookings.filter(b => {
        if (!searchQuery.trim()) return false;
        const q = searchQuery.toLowerCase();
        return (
            b.room.toLowerCase().includes(q) ||
            b.block.toLowerCase().includes(q) ||
            b.name.toLowerCase().includes(q) ||
            b.department.toLowerCase().includes(q) ||
            b.purpose.toLowerCase().includes(q)
        );
    }).slice(0, 5); // Max 5 results to keep it clean

    return (
        <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl flex items-center justify-between px-6 z-50 sticky top-0">
            <div className="flex-1 flex items-center">
                <div className="max-w-md w-full relative" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all relative z-10"
                        placeholder="Global search (press Ctrl+K)"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {isSearchOpen && searchQuery.trim() && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-0 bg-black/10 dark:bg-black/40"
                                    onClick={() => setIsSearchOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
                                >
                                    {filteredBookings.length > 0 ? (
                                        <ul className="max-h-96 overflow-y-auto py-2">
                                            {filteredBookings.map((b) => (
                                                <li key={b.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-semibold text-gray-900 dark:text-white">{b.purpose}</span>
                                                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            {b.room} ({b.block})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 gap-3">
                                                        <div className="flex items-center">
                                                            <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                                                            {b.date}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                                            {b.name} ({b.department})
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            No bookings found matching &quot;{searchQuery}&quot;
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div className="ml-4 flex items-center space-x-4">
                <button
                    onClick={onExport}
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                    onClick={logout}
                    className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </button>
            </div>
        </nav>
    );
}
