import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [svelte(), tailwindcss()],
	server: {
		port: 5173,
	},
	build: {
		// Optimize for Cloudflare Pages
		target: "esnext",
		minify: "esbuild",
		cssCodeSplit: true,
		rollupOptions: {
			input: {
				main: "./index.html",
			},
			output: {
				// Create vendor chunks for better caching
				manualChunks: (id) => {
					if (id.includes("node_modules")) {
						if (id.includes("svelte")) {
							return "svelte";
						}
						return "vendor";
					}
				},
				// Use content hash for better caching
				entryFileNames: "assets/[name].[hash].js",
				chunkFileNames: "assets/[name].[hash].js",
				assetFileNames: "assets/[name].[hash].[ext]",
			},
		},
		// Enable source maps for debugging
		sourcemap: true,
		// Increase chunk size warning limit
		chunkSizeWarningLimit: 1000,
	},
	// Environment variable prefix for client
	envPrefix: "VITE_",
});
