import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
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
});
