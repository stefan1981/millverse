import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  server: {
    allowedHosts: ['millverse-pathoptimizer.zahl1.de'],
    host: '0.0.0.0',
    port: 5173
  },
  base: './'
});
