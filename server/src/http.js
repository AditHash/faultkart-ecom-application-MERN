// Shared request helpers for every FaultKart router.
export function session(req) {
  const value = req.header('x-demo-session') || 'demo';
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : 'demo';
}
export function safe(handler) { return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next); }

const text = (value, max) => typeof value === 'string' && value.trim() && value.length <= max;
export const isText = text;
export function cleanText(value, max = 200) { return text(value, max) ? value.trim() : ''; }
