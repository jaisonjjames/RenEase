const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiBaseUrl = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, '')
  : 'http://localhost:5001';

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};
