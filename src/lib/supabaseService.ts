import { Lead, Appointment } from '../types';
import { supabase, isSupabaseConfigured as isConfigured } from '../supabase.js';

export const isSupabaseConfigured = (): boolean => {
  return isConfigured;
};

export const supabaseClient = supabase;

// Main database operation service exports
export const supabaseService = {
  // CONFIG & STATE
  isConfigured: () => isSupabaseConfigured(),
  getSupabaseUrl: () => ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim(),
  getSupabaseAnonKey: () => ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim(),

  // LEADS MANAGEMENT
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabaseClient
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Lead[];
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
    const { data, error } = await supabaseClient
      .from('leads')
      .insert([lead])
      .select();
    
    if (error) throw error;
    if (data && data[0]) return data[0] as Lead;
    throw new Error('Failed to create lead file');
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabaseClient
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    if (data && data[0]) return data[0] as Lead;
    throw new Error('Lead file not found');
  },

  async deleteLead(id: string): Promise<boolean> {
    const { error } = await supabaseClient
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // APPOINTMENTS MANAGEMENT
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('*')
      .order('scheduled_time', { ascending: true });
    
    if (error) throw error;
    return (data || []) as Appointment[];
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
    const { data, error } = await supabaseClient
      .from('appointments')
      .insert([appointment])
      .select();
    
    if (error) throw error;
    if (data && data[0]) return data[0] as Appointment;
    throw new Error('Failed to book briefing slot');
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabaseClient
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    if (data && data[0]) return data[0] as Appointment;
    throw new Error('Briefing slot not found');
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const { error } = await supabaseClient
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // AUTHENTICATION
  async signIn(email: string, password: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      return { user: data?.user, error };
    } catch (err: any) {
      return { user: null, error: err };
    }
  },

  async signOut(): Promise<void> {
    await supabaseClient.auth.signOut();
  },

  async getCurrentUser(): Promise<any> {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }
};
