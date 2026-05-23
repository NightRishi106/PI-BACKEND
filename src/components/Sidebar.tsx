import { Users, Calendar, BarChart3, Database, LogOut, X, Building, Zap, ZapOff } from 'lucide-react';

interface SidebarProps {
  activeTab: 'overview' | 'leads' | 'appointments' | 'db-setup';
  setActiveTab: (tab: 'overview' | 'leads' | 'appointments' | 'db-setup') => void;
  user: any;
  onLogout: () => void;
  isRealDb: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isRealDb,
  onCloseMobile
}: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3, desc: 'Analytics & Pipeline' },
    { id: 'leads', name: 'Client Leads', icon: Users, desc: 'Onboarding & Budgets' },
    { id: 'appointments', name: 'Consultations', icon: Calendar, desc: 'Advisor Schedules' },
    { id: 'db-setup', name: 'Database Setup', icon: Database, desc: 'Supabase Integration' },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-[#0b0c11] border-r border-slate-800/80 text-slate-200">
      {/* Header section */}
      <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-900 border border-amber-500/20 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/5">
            <Building className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <h1 className="font-display font-semibold tracking-tight text-slate-100 text-sm">
              PUSHKER INVESTMENTS
            </h1>
            <p className="text-[9px] text-amber-500/85 font-mono tracking-wider uppercase">
              Advisor Backend Desk
            </p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-slate-105 p-1 hover:bg-slate-800/50 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Integration Badge */}
      <div className="px-6 py-3 bg-[#0d0f17] border-b border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-medium">
          {isRealDb ? (
            <>
              <Zap className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400">SUPABASE ACTIVE</span>
            </>
          ) : (
            <>
              <ZapOff className="h-3 w-3 text-rose-500" />
              <span className="text-rose-500">SUPABASE OFFLINE</span>
            </>
          )}
        </div>
        <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-slate-400">
          v1.0.4
        </span>
      </div>

      {/* Main navigation menu items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-150 text-left cursor-pointer group ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-500/80'
              }`} />
              <div className="flex-1 min-w-0">
                <span className="text-xs block leading-tight">{item.name}</span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  {item.desc}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Information & Sign Out block */}
      <div className="p-4 bg-[#0a0c10] border-t border-slate-800/80 m-4 rounded-xl">
        <div className="flex items-center gap-3 mb-3.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-slate-950 font-display font-medium text-xs flex items-center justify-center">
            {user?.email?.split('@')[0]?.substring(0, 2)?.toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-slate-200 font-medium block truncate">
              {user?.email?.split('@')[0]}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-mono">
              {user?.email || 'admin@vance.com'}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-rose-400 hover:text-rose-300 text-xs font-medium rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Account</span>
        </button>
      </div>
    </div>
  );
}
