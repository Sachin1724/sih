import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔍 API URL:', API_URL);
console.log('🔍 All env vars:', import.meta.env);

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
