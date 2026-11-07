import { mockRequest } from './mock-api.js';

const request = (method, url, body) => mockRequest(method, url, body);

export const api = {
  get: url => request('GET', url),
  post: (url, body = {}) => request('POST', url, body),
  put: (url, body = {}) => request('PUT', url, body),
  del: url => request('DELETE', url)
};

let mePromise = null;
export const me = () => mePromise || (mePromise = api.get('/auth/me').catch(() => ({ user: null })));
export const resetMe = () => { mePromise = null; };

export function goLogin() {
  location.href = `/login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
}
