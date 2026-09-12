export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/api'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
