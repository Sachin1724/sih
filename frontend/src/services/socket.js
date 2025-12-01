import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
});

socket.on('connect', () => {
    console.log('✅ Connected to Socket.io server');
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from Socket.io server');
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

export default socket;
