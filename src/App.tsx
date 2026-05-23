import { useState, useEffect } from 'react';
import { Menu, Clock, HelpCircle, Activity, Building, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabaseService } from './lib/supabaseService';
import { Lead, Appointment } from './types';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { LeadsManager } from './components/LeadsManager';
import { AppointmentsManager } from './components/AppointmentsManager';
import { SchemaGuide } from './components/SchemaGuide';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // App data state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Panel management
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'appointments' | 'db-setup'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const isRealDb = supabaseService.isConfigured();

  // 1. Check active user session on boot and register history navigation listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    const initAuth = async () => {
      try {
        const currentUser = await supabaseService.getCurrentUser();
        setUser(currentUser);
        
        // Initial routing logic based on authentication status
        const path = window.location.pathname;
        if (currentUser) {
          if (path !== '/admin/dashboard') {
            window.history.pushState({}, '', '/admin/dashboard');
            setCurrentPath('/admin/dashboard');
          }
        } else {
          if (path === '/admin/dashboard') {
            window.history.pushState({}, '', '/login');
            setCurrentPath('/login');
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    initAuth();

    // Set real-time ticking clock for premium status bar
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(interval);
    };
  }, []);

  // 2. Load CRM tables when logged in
  const fetchAllData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const fetchedLeads = await supabaseService.getLeads();
      const fetchedApps = await supabaseService.getAppointments();
      setLeads(fetchedLeads);
      setAppointments(fetchedApps);
    } catch (err: any) {
      console.error('Error compiling CRM data:', err);
      setLeads([]);
      setAppointments([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAllData();

    // 5. Automatically refresh dashboard data every 15 seconds
    const intervalId = setInterval(async () => {
      try {
        const fetchedLeads = await supabaseService.getLeads();
        const fetchedApps = await supabaseService.getAppointments();
        setLeads(fetchedLeads);
        setAppointments(fetchedApps);
      } catch (err: any) {
        console.error('Silent auto-refresh error:', err);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Auth Action Handlers
  const handleLoginSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    window.history.pushState({}, '', '/admin/dashboard');
    setCurrentPath('/admin/dashboard');
  };

  const handleLogout = async () => {
    await supabaseService.signOut();
    setUser(null);
    window.history.pushState({}, '', '/login');
    setCurrentPath('/login');
    // Reset tab setting
    setActiveTab('overview');
  };

  // Leads CRUD Handlers
  const handleAddLead = async (leadPayload: Omit<Lead, 'id' | 'created_at'>) => {
    await supabaseService.createLead(leadPayload);
    await fetchAllData(); // Pull fresh list to update components
  };

  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    await supabaseService.updateLead(id, updates);
    await fetchAllData();
  };

  const handleDeleteLead = async (id: string) => {
    await supabaseService.deleteLead(id);
    await fetchAllData();
  };

  // Appointments CRUD Handlers
  const handleAddAppointment = async (appPayload: Omit<Appointment, 'id' | 'created_at'>) => {
    await supabaseService.createAppointment(appPayload);
    await fetchAllData();
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    await supabaseService.updateAppointment(id, updates);
    await fetchAllData();
  };

  const handleDeleteAppointment = async (id: string) => {
    await supabaseService.deleteAppointment(id);
    await fetchAllData();
  };


  // Show page loading screen during auth boot checkup
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3.5">
        <div className="h-9 w-9 bg-slate-900 border border-amber-500/20 rounded-xl flex items-center justify-center animate-pulse">
          <Building className="h-4.5 w-4.5 text-amber-500" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3" />
          <div className="w-4.5 h-4.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="tracking-widest uppercase">Initializing Pushker Investments...</span>
        </div>
      </div>
    );
  }

  // Render Login state & protect routes
  if (!user) {
    if (window.location.pathname === '/admin/dashboard') {
      window.history.replaceState({}, '', '/login');
    }
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Force authenticated users to /admin/dashboard
  if (window.location.pathname !== '/admin/dashboard' && window.location.pathname !== '/db-setup') {
    window.history.replaceState({}, '', '/admin/dashboard');
  }

  // Main authorized layout shell
  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex relative font-sans overflow-x-hidden" id="admin-shell">
      
      {/* 1. Large Screen Sidebar Layout (Permanent Left Rail) */}
      <aside className="hidden md:block w-72 h-screen shrink-0 sticky top-0" id="desktop-sidebar">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
          isRealDb={isRealDb}
        />
      </aside>

      {/* 2. Responsive Mobile Sidebar Menu Overlay Drawer drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" id="mobile-sidebar-container">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-80 h-full animate-slide-in shrink-0">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onLogout={handleLogout}
              isRealDb={isRealDb}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* 3. Main Console Workspace Container on Right */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen" id="main-content-fluid">
        
        {/* Top Operational bar */}
        <header className="h-16 px-4 md:px-8 bg-[#090b0e] border-b border-slate-800/60 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono max-w-full truncate md:visible">
              <span className="text-slate-550 hidden sm:inline">Portfolio Desk</span>
              <ChevronRight className="h-3 w-3 text-slate-650 hidden sm:inline" />
              <span className="text-amber-500 uppercase tracking-widest text-[11px] font-display font-bold">
                {activeTab === 'overview' ? 'Analytical Deck' : 
                 activeTab === 'leads' ? 'Client Onboarding' : 
                 activeTab === 'appointments' ? 'Advisors Calendar' : 'Integration Setup'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Clock Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 border border-slate-850 rounded-lg text-slate-400">
              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{currentTime || '12:53:48'} UTC</span>
            </div>

            {/* Quick status activity tag */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 border border-slate-850 rounded-lg text-emerald-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span className="hidden xs:inline">Terminal Online</span>
            </div>
          </div>

        </header>

        {/* Dynamic Panel Workspace */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {loadingData && (
            <div className="mb-6 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex items-center justify-between text-xs text-indigo-300">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Re-verifying records cache with cloud-replica datastores...</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">FETCHING</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <Overview 
              leads={leads} 
              appointments={appointments} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'leads' && (
            <LeadsManager 
              leads={leads}
              onAddLead={handleAddLead}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsManager 
              appointments={appointments}
              leads={leads}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {activeTab === 'db-setup' && (
            <SchemaGuide 
              isConfigured={isRealDb}
            />
          )}
        </main>

        {/* Global low-density footer */}
        <footer className="py-4 px-8 border-t border-slate-900 bg-[#06070a]/90 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono tracking-wide shrink-0">
          <div>
            &copy; 2026 PUSHKER INVESTMENTS PRIVATE WEALTH MANAGEMENT PARTNERS LTD.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              SLA Compliant
            </span>
            <span className="text-slate-600">|</span>
            <span>SECURE AES-256 SECURED ACCESS</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
