import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Dossier servi tel quel (sans processing) — données JSON générées au build
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Inline les assets < 4 KB dans le JS/CSS (fonts exclues — trop lourdes)
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        legal: fileURLToPath(new URL('./mentions-legales.html', import.meta.url)),
      },
    },
  },

  // Pas de root customisé — index.html est à la racine
  server: {
    port: 5173,
    strictPort: false,
  },

  test: {
    env: {
      VITE_APP_VERSION: '0.0.0-test',
    },
  },
});
