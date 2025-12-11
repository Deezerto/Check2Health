import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Vite proxy handles redirection to localhost:8080
    withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Debug Interceptors - REVERTED
// api.interceptors...

export default api;
