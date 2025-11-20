import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數 (包含 API_KEY)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // 設定相對路徑 './' 以確保在 GitHub Pages 子目錄下能正確載入資源
    base: './',
    define: {
      // 將 process.env.API_KEY 替換為建置時的環境變數值，避免 runtime 報錯
      // 使用 || '' 確保即使沒有設定 key 也不會變成 undefined
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  }
})