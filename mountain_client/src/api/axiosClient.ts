import axios from 'axios';
import { getToken } from '../utils/tokenUtils';

// (#9)
export const axiosClient = axios.create({
  baseURL: 'http://localhost:3200',
});

// (#9)
axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// (#9)
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}
