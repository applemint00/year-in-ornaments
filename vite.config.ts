import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 브라우저에게 "이 사이트는 안전하니 eval을 허용해라"라고 강제로 주입합니다.
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: *; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline';"
    }
  }
});