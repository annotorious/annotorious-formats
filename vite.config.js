import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true })
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: './src/index.ts',
      name: 'AnnotoriousFormats',
      formats: ['es', 'umd'],
      fileName: (format) => 
        format === 'umd' ? `annotorious-formats.js` : `annotorious-formats.es.js`
    },
    rollupOptions: {
      output: {
        assetFileNames: 'annotorious-formats.[ext]'
      }
    }
  }
});