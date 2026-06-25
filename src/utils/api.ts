import { auth } from './firebase';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(endpoint, {
    ...options,
    headers,
  });
}
