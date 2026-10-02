import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		dedupe: ['react', 'react-dom'],
		alias: {
			"@": fileURLToPath(new URL('./src', import.meta.url)),
			'react': fileURLToPath(new URL('./node_modules/react', import.meta.url)),
			'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
		}
	},
	optimizeDeps: {
		include: ['recharts', 'lodash/get', 'lodash/set', 'lodash/merge'],
	},
	build: {
		minify: 'esbuild',
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				changeOrigin: true,
			},
			'/uploads': {
				target: 'http://localhost:8000',
				changeOrigin: true,
			}
		}
	}
})
