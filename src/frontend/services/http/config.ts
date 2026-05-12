declare const process: { env?: Record<string, string | undefined> } | undefined;

const DEFAULT_BASE_URL = 'http://localhost:8000';

const fromEnv = typeof process !== 'undefined' ? process?.env?.EXPO_PUBLIC_API_URL : undefined;

export const API_BASE_URL: string = fromEnv?.replace(/\/+$/, '') || DEFAULT_BASE_URL;
