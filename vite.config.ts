import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { readdirSync, readFileSync } from "node:fs";

export default defineConfig(() => ({
  server: { host: "localhost", port: 8080, strictPort: true },
  preview: { host: "localhost", port: 8080, strictPort: true },
  // Exclude desktop metadata from the build.
  build: { copyPublicDir: false },
  plugins: [react(), {
    name: "game-public-assets", apply: "build",
    generateBundle() {
      const publicRoot = path.resolve(import.meta.dirname, "public");
      const emitDirectory = (directory: string) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          if (["desktop.ini", "thumbs.db"].includes(entry.name.toLowerCase())) continue;
          const filename = path.join(directory, entry.name);
          if (entry.isDirectory()) emitDirectory(filename);
          else this.emitFile({ type: "asset", fileName: path.relative(publicRoot, filename).split(path.sep).join("/"), source: readFileSync(filename) });
        }
      };
      emitDirectory(publicRoot);
      const notices = path.resolve(import.meta.dirname, "THIRD-PARTY-NOTICES.txt");
      this.emitFile({ type: "asset", fileName: "THIRD-PARTY-NOTICES.txt", source: readFileSync(notices) });
    },
  }],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
}));
