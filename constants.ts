import { Contributor, Contribution } from './types';

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

// SEED DATA - Kept for reference or initial manual seeding if desired, but not used by default with Supabase
export const SEED_CONTRIBUTORS: Contributor[] = [
  { id: '1', name: 'Bertrand Atemkeng', created_at: new Date().toISOString() },
  { id: '2', name: 'Juliane Schlegel', created_at: new Date().toISOString() },
];

export const SEED_CONTRIBUTIONS: Contribution[] = [
  { id: 'c1', contributor_id: '1', contributed_at: '2025-05-08', amount_usd: 50, comment: 'Test Transaction', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c2', contributor_id: '1', contributed_at: '2025-05-14', amount_usd: 6000, comment: 'Capital p1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c3', contributor_id: '1', contributed_at: '2025-06-11', amount_usd: 2500, comment: 'Capital p2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c7', contributor_id: '2', contributed_at: '2025-04-30', amount_usd: 10000, comment: 'BNB Course', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c8', contributor_id: '2', contributed_at: '2025-05-19', amount_usd: 8690.54, comment: 'Capital p1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Local Storage Keys
export const API_KEY_STORAGE_KEY = 'geminiApiKey';
export const CONTRIBUTORS_STORAGE_KEY = 'appContributors'; // Will be deprecated in favor of Supabase
export const CONTRIBUTIONS_STORAGE_KEY = 'capitalContributions'; // Will be deprecated
export const SUPABASE_URL_STORAGE_KEY = 'supabaseUrl';
export const SUPABASE_ANON_KEY_STORAGE_KEY = 'supabaseAnonKey';
export const THEME_STORAGE_KEY = 'theme';

// Window Global Keys for Supabase Credentials (Runtime Discovery)
export const WINDOW_SUPABASE_URL_KEY = 'SUPABASE_URL';
export const WINDOW_SUPABASE_ANON_KEY_KEY = 'SUPABASE_ANON_KEY';


// User Messages
export const API_KEY_WARNING = "Gemini API Key not set. AI-powered features are disabled. Please configure your API Key in Settings > API Key.";
export const SUPABASE_NOT_CONFIGURED_YET_WARNING = "Supabase credentials are not yet configured. Please provide them in Settings > Supabase.";
export const SUPABASE_CREDENTIALS_MISSING_WARNING = "Supabase URL or Anon Key not set. Database features are disabled. Please configure in Settings > Supabase.";
export const SUPABASE_INIT_SUCCESS = "Supabase client initialized successfully. Ready to connect to database.";
export const SUPABASE_INIT_FAILURE = "Failed to initialize Supabase client. Check credentials or console.";
export const SUPABASE_SETUP_REQUIRED_BANNER_MESSAGE = "Supabase setup required. Please configure credentials in Settings to enable database features.";


// Chart colors (ensure good contrast and distinctiveness)
export const CHART_COLORS: string[] = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6']; // purple, pink, green, amber, blue

// Card background color scaling for Light Mode
export const LIGHT_THEME_CARD_COLOR_PALE = '#F4F2FF';
export const LIGHT_THEME_CARD_COLOR_MEDIUM = '#B8A7FF';
export const LIGHT_THEME_CARD_COLOR_FULL = '#6A4DF3'; // brand-purple

// Card background color scaling for Dark Mode
export const DARK_THEME_CARD_COLOR_PALE = '#2A2259'; // Dark, desaturated purple
export const DARK_THEME_CARD_COLOR_MEDIUM = '#4B3F8C'; // Mid-dark, saturated purple
export const DARK_THEME_CARD_COLOR_FULL = '#6A4DF3'; // brand-purple (same as light, it's vibrant)