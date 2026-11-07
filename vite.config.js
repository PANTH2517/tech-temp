import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = ['index', 'events', 'event', 'schedule', 'people', 'profile', 'team', 'faq', 'games', 'login', 'register', 'dashboard', '404'];

const routes = [
  [/^\/events\/[^/.]+\/?$/, '/event.html'],
  [/^\/u\/[^/.]+\/?$/, '/profile.html']
];

const handle = (req, res, next) => {
  const [path, query] = (req.url || '').split('?');
  const hit = routes.find(([re]) => re.test(path));
  if (hit) req.url = hit[1] + (query ? '?' + query : '');
  next();
};

const rewrite = () => ({
  name: 'pretty-routes',
  configureServer(server) { server.middlewares.use(handle); },
  configurePreviewServer(server) { server.middlewares.use(handle); }
});

export default defineConfig({
  appType: 'mpa',
  plugins: [rewrite()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: Object.fromEntries(pages.map(p => [p, resolve(import.meta.dirname, p + '.html')]))
    }
  }
});
