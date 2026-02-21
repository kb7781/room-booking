'use client';

import { useState, useEffect, useCallback } from 'react';
import { BLOCKS_DATA, ROOM_CAPACITIES } from '@/lib/data';

export type Classroom = {
    id: string;
    block: string;
    room: string;
    capacity: number;
};

const STORAGE_KEY = 'classroom_definitions';

// Generate initial classrooms from hardcoded data if empty
const getInitialClassrooms = (): Classroom[] => {
    const initial: Classroom[] = [];
    Object.entries(BLOCKS_DATA).forEach(([block, rooms]) => {
        rooms.forEach(room => {
            initial.push({
                id: `${block}-${room}`,
                block,
                room,
                capacity: ROOM_CAPACITIES[room] || 30
            });
        });
    });
    return initial;
};

export function useClassrooms() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setClassrooms(JSON.parse(stored));
                } catch (error) {
                    console.error("Failed to parse classrooms from LocalStorage", error);
                }
            } else {
                // Seed with defaults
                const defaults = getInitialClassrooms();
                setClassrooms(defaults);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
            }
        };

        handleStorageChange();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-sync-classrooms', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-sync-classrooms', handleStorageChange);
        };
    }, []);

    const saveClassrooms = useCallback((newClassrooms: Classroom[]) => {
        setClassrooms(newClassrooms);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newClassrooms));
        window.dispatchEvent(new Event('local-storage-sync-classrooms'));
    }, []);

    const addClassroom = useCallback((classroom: Omit<Classroom, 'id'>) => {
        const newClassroom = { ...classroom, id: crypto.randomUUID() };
        saveClassrooms([...classrooms, newClassroom]);
        return newClassroom;
    }, [classrooms, saveClassrooms]);

    const removeClassroom = useCallback((id: string) => {
        saveClassrooms(classrooms.filter(c => c.id !== id));
    }, [classrooms, saveClassrooms]);

    const updateClassroom = useCallback((updatedClassroom: Classroom) => {
        saveClassrooms(classrooms.map(c => c.id === updatedClassroom.id ? updatedClassroom : c));
    }, [classrooms, saveClassrooms]);

    return {
        classrooms,
        addClassroom,
        removeClassroom,
        updateClassroom
    };
}
