import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.PUBLIC_POSTHOG_KEY': JSON.stringify(env.VITE_PUBLIC_POSTHOG_KEY),
        'process.env.PUBLIC_POSTHOG_HOST': JSON.stringify(env.VITE_PUBLIC_POSTHOG_HOST)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      esbuild: {
        jsx: 'automatic'
      }
    };
});
