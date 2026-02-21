export type Booking = {
    id: string;
    block: string;
    room: string;
    name: string;
    department: string;
    date: string; // Start date YYYY-MM-DD
    endDate?: string; // End date YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    purpose: string;
};

export const BLOCKS_DATA = {
    'Block A': ['A101', 'A102', 'A201', 'A202'],
    'Block B': ['B101', 'B102', 'B201'],
    'Block P': ['P101', 'P102'],
    'Block N': ['N101', 'N102', 'N201'],
};

export const ALL_ROOMS = Object.entries(BLOCKS_DATA).flatMap(([block, rooms]) =>
    rooms.map(room => ({ block, room }))
);

export const ROOM_CAPACITIES: Record<string, number> = {
    'A101': 30, 'A102': 40, 'A201': 60, 'A202': 30,
    'B101': 50, 'B102': 50, 'B201': 80,
    'P101': 20, 'P102': 30,
    'N101': 100, 'N102': 40, 'N201': 40
};
