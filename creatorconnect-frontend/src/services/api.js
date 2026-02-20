import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const initiateSignup = (email) =>
    API.post('/auth/signup/initiate', { email });

export const verifySignupOtp = (data) =>
    API.post('/auth/signup/verify', data);

export const loginUser = (credentials) =>
    API.post('/auth/login', credentials);

// Assets
export const getAssets = () =>
    API.get('/assets');

export const uploadAsset = (formData) =>
    API.post('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export const deleteAsset = (id) =>
    API.delete(`/assets/${id}`);

export default API;