import axios from 'axios';

// In local dev, Vite's dev server proxies "/api" straight to the backend (see
// vite.config.ts), so the relative path works out of the box. In production
// (e.g. a static host like Render/Vercel/Netlify), there is no proxy, so we
// point at an explicit backend URL supplied at build time via VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const client = axios.create({
  baseURL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
