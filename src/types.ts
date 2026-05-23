export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'closed_lost';

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  investment_budget: number;
  status: LeadStatus;
  interest_area: string;
  notes: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  created_at: string;
  lead_id?: string;
  lead_name: string;
  lead_email: string;
  consultant_name: string;
  scheduled_time: string;
  status: AppointmentStatus;
  notes: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isMocked: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
}
