import { execSync } from 'child_process';
import { defineConfig } from 'vite';

const gitHash = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(gitHash),
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
