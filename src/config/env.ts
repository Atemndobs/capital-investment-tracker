import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_GEMINI_API_KEY: z.string().optional(),
  VITE_PUBLIC_POSTHOG_KEY: z.string().optional(),
  VITE_PUBLIC_POSTHOG_HOST: z.string().optional(),
});

// Safely parse environment variables using the schema
const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.errors);
  // In a real application, you might want to throw an error or handle this more gracefully
  // For now, we'll log and continue, but critical variables might be missing.
}

// Export environment variables, providing fallbacks or defaults if necessary
export const env = {
  VITE_SUPABASE_URL: parsedEnv.data?.VITE_SUPABASE_URL ?? 'fallback_supabase_url',
  VITE_SUPABASE_ANON_KEY: parsedEnv.data?.VITE_SUPABASE_ANON_KEY ?? 'fallback_supabase_anon_key',
  VITE_GEMINI_API_KEY: parsedEnv.data?.VITE_GEMINI_API_KEY ?? undefined,
  VITE_PUBLIC_POSTHOG_KEY: parsedEnv.data?.VITE_PUBLIC_POSTHOG_KEY ?? undefined,
  VITE_PUBLIC_POSTHOG_HOST: parsedEnv.data?.VITE_PUBLIC_POSTHOG_HOST ?? undefined,
};

// Log environment status
console.group('Environment Variables Status');
Object.entries(env).forEach(([key, value]) => {
  if (key === 'VITE_SUPABASE_ANON_KEY' || key === 'VITE_GEMINI_API_KEY') {
    console.log(`${key}: ${value ? '********' : 'not set'}`);
  } else {
    console.log(`${key}: ${value || 'not set'}`);
  }
});
console.groupEnd();

// Export individual variables for easier imports
export const {
  VITE_SUPABASE_URL: SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  VITE_GEMINI_API_KEY: GEMINI_API_KEY,
} = env;
