import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Vite по умолчанию вшивает ассеты меньше 4 КБ в JS как base64. Для файлов
    // из src/materials это неверно: небольшой конспект попадал бы в бандл и
    // грузился на каждой странице, хотя нужен только при скачивании. Ноль —
    // все ассеты остаются отдельными файлами.
    assetsInlineLimit: 0,
  },
});
