import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173, // 포트 명시
		proxy: {
			// /auth 로 시작하는 요청은 5000번으로 전달
			'/auth': {
				target: 'http://localhost:5000',
				changeOrigin: true,
				secure: false,
			}
		}
	}
})
