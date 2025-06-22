
export interface Contributor {
  id: string; // Will be UUID from Supabase
  name: string;
  email?: string | null;
  profilePictureUrl?: string | null; // Will map to 'profilepictureurl' from DB
  created_at?: string; // Supabase default field
}

export interface Contribution {
  id: string; // Will be UUID from Supabase
  contributor_id: string; // Foreign key to Contributor
  contributed_at: string; // ISO date string e.g., "2025-05-08"
  amount_usd: number;
  comment?: string | null;
  created_at?: string; // Supabase default field
  updated_at?: string; // Supabase default field

  // For optimistic UI updates
  tempId?: string; // Client-generated ID before Supabase confirmation
  isOptimistic?: boolean;
  hasError?: boolean; // If an optimistic update failed and needs attention/reversion
}

export interface SummaryStats {
  total: number;
  percentageShare: number;
  diffToTarget: number;
  progressToTarget: number;
  amountOwedToMatchTop: number;
}

export interface ContributorSummary extends Contributor {
  stats: SummaryStats;
}

export enum ModalView {
  NONE,
  ADD_CONTRIBUTION,
  EDIT_CONTRIBUTION,
  SETTINGS,
}

// For Supabase service
export interface SupabaseCredentials {
  url: string | null;
  anonKey: string | null;
}

export type SupabaseStatusType = 'success' | 'error' | 'warning' | 'SUPABASE_NOT_CONFIGURED_YET';
export interface SupabaseStatus {
    message: string;
    type: SupabaseStatusType;
}

export interface GeminiStatus {
    message: string;
    type: 'success' | 'error' | 'warning';
}