import { defineConfig } from 'vite';

export default defineConfig({
    // 开发服务器配置
    server: {
        port: 5500,
        open: true,
        cors: true
    },

    // 构建配置
    build: {
        outDir: 'dist',
        sourcemap: true,
        minify: 'terser',
        rollupOptions: {
            input: {
                main: 'index.html'
            }
        }
    },

    // 预览服务器配置
    preview: {
        port: 4173,
        open: true
    }
});
