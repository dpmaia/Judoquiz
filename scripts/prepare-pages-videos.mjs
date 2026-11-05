import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmdirSync, unlinkSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = join(root, 'Videos');
const destination = join(root, 'public', 'videos');
const requested = new Set(process.argv.slice(2));
const sources = new Map();

for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
  const match = entry.isFile() && /^questao-\d+_([A-Za-z0-9_-]{11})\.(mp4|webm|mkv)$/i.exec(entry.name);
  if (!match) continue;
  const [, id, extension] = match;
  if (requested.size && !requested.has(id)) continue;
  if (sources.has(id)) throw new Error(`Mais de um original para ${id}.`);
  const compatible = join(sourceDir, '.browser', `${id}.mp4`);
  const hasCompatible = existsSync(compatible);
  if (!hasCompatible && extension.toLowerCase() === 'mkv') throw new Error(`Cópia MP4 ausente para ${id}.`);
  sources.set(id, hasCompatible ? compatible : join(sourceDir, entry.name));
}

for (const id of requested) {
  if (!sources.has(id)) throw new Error(`Vídeo não encontrado: ${id}.`);
}
if (!sources.size) throw new Error('Nenhum arquivo questao-NNN_ID foi encontrado em Videos/.');

mkdirSync(destination, { recursive: true });
const pending = [...sources].filter(([id]) => !existsSync(join(destination, `${id}.mp4`)));
console.log(`${sources.size - pending.length} MP4 já preparados. ${pending.length} a converter.`);
const tempDir = mkdtempSync(join(sourceDir, '.pages-'));

async function convert(id, input) {
  const temp = join(tempDir, `${id}.mp4`);
  try {
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn(process.env.JUDO_FFMPEG || 'ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-threads', '2', '-filter_threads', '1', '-i', input,
        '-map', '0:v:0', '-vf', 'scale=-2:480,setsar=1', '-c:v', 'libx264', '-threads', '2',
        '-preset', 'veryfast', '-crf', '25', '-pix_fmt', 'yuv420p', '-an',
        '-map_metadata', '-1', '-map_chapters', '-1', '-movflags', '+faststart', temp,
      ], { stdio: ['ignore', 'ignore', 'inherit'], windowsHide: true });
      ffmpeg.on('error', reject);
      ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg falhou em ${id} (${code}).`)));
    });
    renameSync(temp, join(destination, `${id}.mp4`));
    console.log(`Preparado: ${id}.mp4`);
  } finally {
    if (existsSync(temp)) unlinkSync(temp);
  }
}

try {
  const concurrency = Math.max(1, Math.min(6, Math.floor(availableParallelism() / 2)));
  for (let index = 0; index < pending.length; index += concurrency) {
    const results = await Promise.allSettled(pending.slice(index, index + concurrency).map(([id, input]) => convert(id, input)));
    const errors = results.flatMap(result => result.status === 'rejected' ? [result.reason] : []);
    if (errors.length) throw new AggregateError(errors, 'Falha ao preparar os vídeos para o GitHub Pages.');
  }
} finally {
  rmdirSync(tempDir);
}
