import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    // TAMBAHKAN BLOK PENGATURAN DOCKER DI BAWAH INI
    server: {
        host: '0.0.0.0', // Mengizinkan Vite diakses dari luar container Docker
        hmr: {
            host: 'localhost', // Memaksa browser Windows membaca koneksi asset ke localhost
        },

        watch: {
            // Bind mount Docker Desktop di Windows kadang tidak mengirim event
            // filesystem native, terutama untuk file BARU. Polling memastikan
            // Vite tetap mendeteksi perubahan/penambahan file.
            usePolling: true,
        },
    },
});
