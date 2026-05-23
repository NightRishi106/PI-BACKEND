import { Lead, Appointment, LeadStatus, AppointmentStatus } from '../types';
import { supabase, isSupabaseConfigured as isConfigured } from '../supabase.js';

export const isSupabaseConfigured = (): boolean => {
  return isConfigured;
};

export const supabaseClient = supabase;


// Initial Mock leads for Investment Consulting
const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    name: 'Alexander Mercer',
    email: 'a.mercer@mercerholdings.com',
    phone: '+1 (555) 019-2834',
    investment_budget: 750000,
    status: 'qualified',
    interest_area: 'Wealth Management',
    notes: 'Inquired about offshore estate planning and dynamic asset allocation. Very keen on gold index and tech portfolio.'
  },
  {
    id: 'lead-2',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@vanguardia.io',
    phone: '+1 (555) 728-1192',
    investment_budget: 1500000,
    status: 'nurturing',
    interest_area: 'Real Estate Funds',
    notes: 'Looking to hedge commercial real estate exposure into European REITs. Prefers green energy infrastructure funds.'
  },
  {
    id: 'lead-3',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    name: 'Marcus Chen',
    email: 'marcus.chen@infotech.sg',
    phone: '+65 9182 7364',
    investment_budget: 3500000,
    status: 'new',
    interest_area: 'Alternative Assets & VC',
    notes: 'Tech founder looking to seed startup funds and purchase private equity tokens. High risk tolerance.'
  },
  {
    id: 'lead-4',
    created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    name: 'Elena Rostova',
    email: 'e.rostova@genevagroup.ch',
    phone: '+41 22 748 1199',
    investment_budget: 500000,
    status: 'converted',
    interest_area: 'Retirement & Trust Planning',
    notes: 'Completed standard onboarding. Onboarding assets allocated to conservative high-yield global bonds.'
  },
  {
    id: 'lead-5',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    name: 'David Pushker',
    email: 'david@pushkerconstruction.com',
    phone: '+1 (555) 231-9878',
    investment_budget: 250000,
    status: 'contacted',
    interest_area: 'Tax-Advantaged Mutual Funds',
    notes: 'First-time client requesting pre-retirement safety strategy. Followed up on his tax-free yield questions.'
  },
  {
    id: 'lead-6',
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    name: 'Sarah Jenkins',
    email: 'sarah.j@bloomventures.org',
    phone: '+1 (555) 837-1210',
    investment_budget: 4500000,
    status: 'closed_lost',
    interest_area: 'Wealth Management',
    notes: 'Desired ultra-aggressive options strategy that didn\'t match our risk advisory standards. Closed contact.'
  }
];

// Initial Mock Appointments for Investment Consulting
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lead_id: 'lead-1',
    lead_name: 'Alexander Mercer',
    lead_email: 'a.mercer@mercerholdings.com',
    consultant_name: 'Sarah Pushker (Chief Strategist)',
    scheduled_time: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(), // Tomorrow afternoon
    status: 'scheduled',
    notes: 'Review initial draft of Wealth Allocation Plan. Needs projection charts for capital growth.'
  },
  {
    id: 'app-2',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    lead_id: 'lead-2',
    lead_name: 'Sofia Rodriguez',
    lead_email: 'sofia.rodriguez@vanguardia.io',
    consultant_name: 'Robert Pushker (Real Estate Partner)',
    scheduled_time: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(), // Day after tomorrow
    status: 'scheduled',
    notes: 'Video call regarding European Logistics Real Estate fund distribution.'
  },
  {
    id: 'app-3',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    lead_id: 'lead-4',
    lead_name: 'Elena Rostova',
    lead_email: 'e.rostova@genevagroup.ch',
    consultant_name: 'Sarah Pushker (Chief Strategist)',
    scheduled_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    status: 'completed',
    notes: 'Final Trust documentation signed. Account officially verified and funded.'
  }
];

// LocalStorage helpers for mock data
const getMockLeads = (): Lead[] => {
  const local = localStorage.getItem('inv_mock_leads');
  if (!local) {
    localStorage.setItem('inv_mock_leads', JSON.stringify(INITIAL_LEADS));
    return INITIAL_LEADS;
  }
  return JSON.parse(local);
};

const setMockLeads = (leads: Lead[]) => {
  localStorage.setItem('inv_mock_leads', JSON.stringify(leads));
};

const getMockAppointments = (): Appointment[] => {
  const local = localStorage.getItem('inv_mock_appointments');
  if (!local) {
    localStorage.setItem('inv_mock_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    return INITIAL_APPOINTMENTS;
  }
  return JSON.parse(local);
};

const setMockAppointments = (apps: Appointment[]) => {
  localStorage.setItem('inv_mock_appointments', JSON.stringify(apps));
};

// Main database operation service exports
export const supabaseService = {
  // CONFIG & STATE
  isConfigured: () => isSupabaseConfigured(),
  getSupabaseUrl: () => ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim(),
  getSupabaseAnonKey: () => ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim(),

  // LEADS MANAGEMENT
  async getLeads(): Promise<Lead[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []) as Lead[];
      } catch (err) {
        console.warn('Supabase query failed, falling back to local simulation:', err);
        return getMockLeads();
      }
    } else {
      return getMockLeads();
    }
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID ? crypto.randomUUID() : 'l-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('leads')
          .insert([newLead])
          .select();
        
        if (error) throw error;
        if (data && data[0]) return data[0] as Lead;
      } catch (err) {
        console.warn('Supabase insert failed, executing in local simulation:', err);
      }
    }

    // Fallback simulation
    const currentLeads = getMockLeads();
    const updated = [newLead, ...currentLeads];
    setMockLeads(updated);
    return newLead;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('leads')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) throw error;
        if (data && data[0]) return data[0] as Lead;
      } catch (err) {
        console.warn('Supabase update failed, executing in local simulation:', err);
      }
    }

    // Fallback simulation
    const currentLeads = getMockLeads();
    let updatedLead: Lead | null = null;
    const updated = currentLeads.map(l => {
      if (l.id === id) {
        updatedLead = { ...l, ...updates };
        return updatedLead;
      }
      return l;
    });
    setMockLeads(updated);
    if (!updatedLead) throw new Error('Lead not found');
    return updatedLead;
  },

  async deleteLead(id: string): Promise<boolean> {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('leads')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase delete failed, executing in local simulation:', err);
      }
    }

    // Fallback simulation
    const currentLeads = getMockLeads();
    const filtered = currentLeads.filter(l => l.id !== id);
    setMockLeads(filtered);
    
    // Also remove appointments for this lead, if any
    const currentApps = getMockAppointments();
    const filteredApps = currentApps.filter(app => app.lead_id !== id);
    setMockAppointments(filteredApps);

    return true;
  },

  // APPOINTMENTS MANAGEMENT
  async getAppointments(): Promise<Appointment[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('appointments')
          .select('*')
          .order('scheduled_time', { ascending: true });
        
        if (error) throw error;
        return (data || []) as Appointment[];
      } catch (err) {
        console.warn('Supabase appointment query failed, falling back to local simulation:', err);
        return getMockAppointments();
      }
    } else {
      return getMockAppointments();
    }
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
    const newApp: Appointment = {
      ...appointment,
      id: crypto.randomUUID ? crypto.randomUUID() : 'a-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('appointments')
          .insert([newApp])
          .select();
        
        if (error) throw error;
        if (data && data[0]) return data[0] as Appointment;
      } catch (err) {
        console.warn('Supabase insert failed, executing in local simulation:', err);
      }
    }

    // Fallback simulation
    const currentApps = getMockAppointments();
    const updated = [...currentApps, newApp];
    // Sort appointments: closest scheduled_time first
    updated.sort((b, d) => new Date(b.scheduled_time).getTime() - new Date(d.scheduled_time).getTime());
    setMockAppointments(updated);
    return newApp;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('appointments')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) throw error;
        if (data && data[0]) return data[0] as Appointment;
      } catch (err) {
        console.warn('Supabase update failed, executing in local simulation:', err);
      }
    }

    // Fallback simulation
    const currentApps = getMockAppointments();
    let updatedApp: Appointment | null = null;
    const updated = currentApps.map(a => {
      if (a.id === id) {
        updatedApp = { ...a, ...updates };
        return updatedApp;
      }
      return a;
    });
    setMockAppointments(updated);
    if (!updatedApp) throw new Error('Appointment not found');
    return updatedApp;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('appointments')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase delete failed, executing in local simulation:', err);
      }
    }

    // Fallback simulation
    const currentApps = getMockAppointments();
    const filtered = currentApps.filter(a => a.id !== id);
    setMockAppointments(filtered);
    return true;
  },

  // AUTHENTICATION
  async signIn(email: string, password: string): Promise<{ user: any; error: any }> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        return { user: data?.user, error };
      } catch (err: any) {
        return { user: null, error: err };
      }
    } else {
      // Offline local credential demo simulation
      // Accept demo login explicitly mentioned in the UI: admin@investment.com / admin123
      if (email === 'admin@investment.com' && password === 'admin123') {
        const mockUser = {
          id: 'mock-admin-id',
          email: 'admin@investment.com'
        };
        localStorage.setItem('inv_mock_session', JSON.stringify(mockUser));
        return { user: mockUser, error: null };
      } else {
        return { 
          user: null, 
          error: { message: 'Invalid credentials. Hint: in local sandbox mode, use admin@investment.com and admin123' } 
        };
      }
    }
  },

  async signOut(): Promise<void> {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('inv_mock_session');
  },

  async getCurrentUser(): Promise<any> {
    if (supabaseClient) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
      } catch {
        return null;
      }
    } else {
      const stored = localStorage.getItem('inv_mock_session');
      return stored ? JSON.parse(stored) : null;
    }
  },

  // Onboarding action: reset to defaults
  resetMockData() {
    localStorage.setItem('inv_mock_leads', JSON.stringify(INITIAL_LEADS));
    localStorage.setItem('inv_mock_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
  }
};
