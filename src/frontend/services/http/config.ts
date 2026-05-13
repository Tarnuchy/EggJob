const DEFAULT_BASE_URL = 'http://localhost:8000';

const fromEnv = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL: string = fromEnv?.replace(/\/+$/, '') || DEFAULT_BASE_URL;

export const USE_HTTP_SERVICES: boolean = process.env.EXPO_PUBLIC_USE_HTTP_SERVICES === 'true';
