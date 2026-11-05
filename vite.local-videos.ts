import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

function byteRange(range: string | undefined, size: number): [number, number] | null {
  if (!range) return [0, size - 1];
  const parts = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!parts || (!parts[1] && !parts[2])) return null;
  const start = parts[1] ? Number(parts[1]) : Math.max(0, size - Number(parts[2]));
  const end = parts[1] && parts[2] ? Math.min(Number(parts[2]), size - 1) : size - 1;
  return start <= end ? [start, end] : null;
}

export function localVideos(): Plugin {
  const files = new Map<string, { path: string; type: string }>();

  function serve(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const id = /^\/study-media\/([A-Za-z0-9_-]{11})$/.exec(req.url?.split('?')[0] ?? '')?.[1];
    if (!id || (req.method !== 'GET' && req.method !== 'HEAD')) return next();
    const file = files.get(id);
    const size = file && statSync(file.path, { throwIfNoEntry: false })?.size;
    if (!file || !size) {
      res.writeHead(404).end();
      return;
    }

    const range = byteRange(req.headers.range, size);
    if (!range) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
      return;
    }
    const [start, end] = range;
    const headers: Record<string, string | number> = {
      'Content-Type': file.type,
      'Content-Length': end - start + 1,
      'Accept-Ranges': 'bytes',
    };
    if (req.headers.range) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    res.writeHead(req.headers.range ? 206 : 200, headers);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const stream = createReadStream(file.path, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  }

  return {
    name: 'judo-local-videos',
    config({ root = process.cwd(), publicDir = 'public' }, { mode }) {
      const paths: Record<string, string> = Object.create(null);
      if (mode !== 'test' && publicDir !== false) {
        const published = resolve(root, publicDir, 'videos');
        if (existsSync(published)) {
          for (const file of readdirSync(published, { withFileTypes: true })) {
            if (!file.isFile()) continue;
            const id = /^([A-Za-z0-9_-]{11})\.(mp4|webm)$/.exec(file.name)?.[1];
            if (id) paths[id] = `videos/${file.name}`;
          }
        }
      }

      const dir = resolve(root, 'Videos');
      if (mode !== 'github-pages' && mode !== 'test' && existsSync(dir)) {
        for (const file of readdirSync(dir, { withFileTypes: true })) {
          if (!file.isFile()) continue;
          const match = /_([A-Za-z0-9_-]{11})\.(webm|mp4|mkv)$/i.exec(file.name);
          if (!match) continue;
          const [, id, extension] = match;
          const format = extension.toLowerCase();
          const compatibleCopy = join(dir, '.browser', `${id}.mp4`);
          if (existsSync(compatibleCopy)) {
            files.set(id, { path: compatibleCopy, type: 'video/mp4' });
          } else if (format !== 'mkv') {
            files.set(id, { path: join(dir, file.name), type: `video/${format}` });
          }
        }
      }
      for (const id of files.keys()) paths[id] = `study-media/${id}`;
      return {
        define: { __STUDY_VIDEO_PATHS__: JSON.stringify(paths) },
        server: { fs: { deny: ['**/.env', '**/.env.*', '**/*.{crt,pem}', '**/.git/**', '**/Videos/**'] } },
      };
    },
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve);
    },
  };
}
