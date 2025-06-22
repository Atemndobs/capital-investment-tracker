
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Contribution, Contributor, SupabaseStatus } from './types';
import { 
    SUPABASE_CREDENTIALS_MISSING_WARNING,
    SUPABASE_INIT_SUCCESS,
    SUPABASE_INIT_FAILURE,
    SUPABASE_NOT_CONFIGURED_YET_WARNING
} from './constants';

let supabase: SupabaseClient | null = null;
let currentSupabaseUrl: string | null = null;
let currentSupabaseAnonKey: string | null = null;
let isConfiguredAttempted = false; // Tracks if an initialization has been attempted

export const initializeSupabaseService = (url: string | null, anonKey: string | null): boolean => {
  isConfiguredAttempted = true; 
  if (url && anonKey && url.trim() !== "" && anonKey.trim() !== "") {
    try {
      if (supabase && currentSupabaseUrl === url && currentSupabaseAnonKey === anonKey) {
        console.info("Supabase client already initialized with the same credentials.");
        return true;
      }
      supabase = createClient(url, anonKey);
      currentSupabaseUrl = url;
      currentSupabaseAnonKey = anonKey;
      console.info(SUPABASE_INIT_SUCCESS);
      return true;
    } catch (error) {
      supabase = null;
      currentSupabaseUrl = null; 
      currentSupabaseAnonKey = null;
      console.error(SUPABASE_INIT_FAILURE, error);
      return false;
    }
  } else {
    supabase = null;
    currentSupabaseUrl = null;
    currentSupabaseAnonKey = null;
    return false;
  }
};

export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

export const getSupabaseStatus = (): SupabaseStatus => {
    if (currentSupabaseUrl && currentSupabaseAnonKey && supabase) return { message: SUPABASE_INIT_SUCCESS, type: 'success' };
    if (currentSupabaseUrl && currentSupabaseAnonKey && !supabase) return { message: SUPABASE_INIT_FAILURE, type: 'error' }; 
    if (isConfiguredAttempted && (!currentSupabaseUrl || !currentSupabaseAnonKey)) return { message: SUPABASE_CREDENTIALS_MISSING_WARNING, type: 'warning' }; 
    return { message: SUPABASE_NOT_CONFIGURED_YET_WARNING, type: 'SUPABASE_NOT_CONFIGURED_YET' }; 
};

// Contributor CRUD
export const fetchContributors = async (): Promise<Contributor[]> => {
  if (!supabase) throw new Error("Supabase client not initialized or not available.");

  const { data: contribData, error: contribError } = await supabase
    .from('contributors')
    .select('id, name, email, created_at, profilePictureUrl:profilepictureurl');

  if (contribError) {
    console.error("Error fetching from contributors table:", contribError.message);
    throw contribError; 
  }
  
  const result: Contributor[] = (contribData || []).map(c => ({
    ...c,
    // Supabase client might return null for profilepictureurl, ensure it's handled
    profilePictureUrl: c.profilePictureUrl || null 
  }));
  
  result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); 

  return result;
};

export const addContributor = async (contributorData: Pick<Contributor, 'name' | 'email' | 'profilePictureUrl'>): Promise<Contributor> => {
  if (!supabase) throw new Error("Supabase client not initialized or not available.");
  
  const payload: any = { name: contributorData.name };
  if (contributorData.email !== undefined) payload.email = contributorData.email;
  // Ensure we send 'profilepictureurl' (lowercase) to the DB
  if (contributorData.profilePictureUrl !== undefined) payload.profilepictureurl = contributorData.profilePictureUrl;

  const { data, error } = await supabase
    .from('contributors')
    .insert([payload])
    .select('id, name, email, created_at, profilePictureUrl:profilepictureurl');
    
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Failed to add contributor, no data returned.");
  return { ...data[0], profilePictureUrl: data[0].profilePictureUrl || null };
};

export const updateContributor = async (id: string, updates: Partial<Pick<Contributor, 'name' | 'email' | 'profilePictureUrl'>>): Promise<Contributor> => {
  if (!supabase) throw new Error("Supabase client not initialized or not available.");

  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  // Ensure we send 'profilepictureurl' (lowercase) to the DB
  if (updates.profilePictureUrl !== undefined) payload.profilepictureurl = updates.profilePictureUrl;


  const { data, error } = await supabase
    .from('contributors')
    .update(payload)
    .eq('id', id)
    .select('id, name, email, created_at, profilePictureUrl:profilepictureurl');

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Failed to update contributor, no data returned.");
  return { ...data[0], profilePictureUrl: data[0].profilePictureUrl || null };
};


// Contribution CRUD
export const fetchContributions = async (): Promise<Contribution[]> => {
  if (!supabase) throw new Error("Supabase client not initialized or not available.");
  const { data, error } = await supabase.from('contributions').select('*').order('contributed_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addContribution = async (contributionData: Omit<Contribution, 'id' | 'created_at' | 'updated_at'>): Promise<Contribution> => {
  if (!supabase) throw new Error("Supabase client not initialized or not available.");
  const payload = { ...contributionData };
  const { data, error } = await supabase.from('contributions').insert([payload]).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Failed to add contribution, no data returned.");
  return data[0];
};

export const updateContribution = async (id: string, updates: Partial<Omit<Contribution, 'id' | 'created_at' | 'updated_at' | 'contributor_id'>>): Promise<Contribution> => {
  if (!supabase) throw new Error("Supabase client not initialized or not available.");
  const payload = { ...updates, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('contributions').update(payload).eq('id', id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Failed to update contribution, no data returned.");
  return data[0];
};

export const deleteContribution = async (id: string): Promise<void> => {
  if (!supabase) throw new Error("Supabase client not initialized or not available.");
  const { error } = await supabase.from('contributions').delete().eq('id', id);
  if (error) throw error;
};