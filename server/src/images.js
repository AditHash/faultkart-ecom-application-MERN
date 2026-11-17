import express from 'express';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Some browsers/networks cannot reach images.unsplash.com directly. The API fetches catalog
// photos server-side, caches them on disk and serves them same-origin. Only Unsplash photo ids
// and a fixed set of widths are accepted, so this can't be used to fetch arbitrary URLs.
const cacheDir = process.env.IMAGE_CACHE_DIR || path.join(os.tmpdir(), 'faultkart-image-cache');
const widths = new Set([200, 400, 850, 1200]);
const photoId = /^photo-[0-9]{10,16}-[0-9a-f]{8,16}$/;
const inflight = new Map();

async function load(id, width) {
  const file = path.join(cacheDir, id + '-' + width + '.jpg');
  try { return await readFile(file); } catch { /* not cached yet */ }
  const response = await fetch('https://images.unsplash.com/' + id + '?auto=format&fit=crop&fm=jpg&q=80&w=' + width,
    { signal: AbortSignal.timeout(15000) });
  if (!response.ok || !String(response.headers.get('content-type')).startsWith('image/')) {
    throw Object.assign(new Error('Image unavailable'), { status: 404 });
  }
  const body = Buffer.from(await response.arrayBuffer());
  await mkdir(cacheDir, { recursive: true });
  await writeFile(file, body);
  return body;
}

export const imageRouter = express.Router();
imageRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  const width = Number(req.query.w || 850);
  if (!photoId.test(id) || !widths.has(width)) return res.status(400).json({ error: 'Invalid image' });
  const key = id + ':' + width;
  try {
    if (!inflight.has(key)) inflight.set(key, load(id, width).finally(() => inflight.delete(key)));
    const body = await inflight.get(key);
    res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=604800, immutable' });
    res.send(body);
  } catch (error) {
    res.status(error.status || 502).json({ error: 'Image unavailable' });
  }
});
