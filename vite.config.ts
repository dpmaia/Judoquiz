import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { localVideos } from './vite.local-videos';
export default defineConfig(({mode}) => ({
  base: mode === 'github-pages' ? '/Judoquiz/' : '/',
  plugins: [react(), localVideos()],
  test: {environment:'jsdom',globals:true},
}));
