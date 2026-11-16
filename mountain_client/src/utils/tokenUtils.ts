import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '../types';

const TOKEN_KEY = 'mountain_tracker_token';

// (#8)
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// (#8)
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// (#8)
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// (#8)
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
