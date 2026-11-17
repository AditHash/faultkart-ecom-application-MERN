import { createContext, useContext } from 'react';

const sessionKey = 'faultkart-session';
const storedSession = localStorage.getItem(sessionKey) || Math.random().toString(36).slice(2, 14);
localStorage.setItem(sessionKey, storedSession);

const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const money = value => formatter.format(Number(value || 0));
export const savings = item => item.mrp > item.price ? Math.round((item.mrp - item.price) / item.mrp * 100) : 0;
export const shortId = id => String(id || '').slice(-8).toUpperCase();
export const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(value).toLocaleDateString('en-IN', options);

export const sessionId = 'demo-' + storedSession;

export async function api(path, options = {}) {
  const response = await fetch('/api' + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-demo-session': sessionId, ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not complete request');
  return data;
}

export function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [path = '', query = ''] = hash.split('?');
  const parts = path.split('/').filter(Boolean);
  return { page: parts[0] || 'home', id: parts[1] || '', sub: parts[2] || '', query, params: new URLSearchParams(query), key: hash };
}
export function navigate(path) {
  window.location.hash = '#/' + path.replace(/^\/+/, '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Catalog photos are served through the API's image cache so the browser never depends on the CDN directly.
const unsplashId = /images\.unsplash\.com\/(photo-[0-9]+-[0-9a-f]+)/;
export function imageUrl(src, width = 400) {
  const match = unsplashId.exec(src || '');
  return match ? '/api/images/' + match[1] + '?w=' + width : (src || '');
}

export const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export const departments = ['Fashion', 'Mobiles', 'Electronics', 'Beauty', 'Home', 'Appliances', 'Toys', 'Grocery',
  'Sports', 'Books', 'Furniture', 'Accessories'];

const pincodeKey = 'faultkart-pincode';
export const savedPincode = () => { try { return localStorage.getItem(pincodeKey) || ''; } catch { return ''; } };
export const storePincode = value => { try { localStorage.setItem(pincodeKey, value); } catch { /* ignore */ } };

export const isoDay = value => new Date(value).toISOString().slice(0, 10);
