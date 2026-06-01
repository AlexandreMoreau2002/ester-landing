import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  // Dossier servi tel quel (sans processing) — données JSON générées au build
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Inline les assets < 4 KB dans le JS/CSS (fonts exclues — trop lourdes)
    assetsInlineLimit: 4096,
  },

  // Pas de root customisé — index.html est à la racine
  server: {
    port: 5173,
    strictPort: false,
  },

  test: {
    env: {
      VITE_APP_VERSION: version,
    },
  },
});
