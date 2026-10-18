import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Caminhos relativos: o app funciona em qualquer endereço,
  // seja na raiz (site.com/) ou numa subpasta (usuario.github.io/dia-a-dia/).
  base: "./",
  plugins: [react()],
});
