import { Lead, Appointment } from '../types';
import { IndianRupee, Inbox, Users2, CalendarDays, TrendingUp, Sparkles, Building, ArrowUpRight } from 'lucide-react';

interface OverviewProps {
  leads: Lead[];
  appointments: Appointment[];
  setActiveTab: (tab: 'leads' | 'appointments') => void;
}

export function Overview({ leads, appointments, setActiveTab }: OverviewProps) {
  // 1. Dynamic Metric Calculations
  const totalPipelineBudget = leads.reduce((sum, lead) => sum + (lead.status !== 'closed_lost' ? lead.investment_budget : 0), 0);
  
  const activeLeadsCount = leads.filter(l => l.status !== 'closed_lost').length;
  
  const convertedCount = leads.filter(l => l.status === 'converted').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0;

  const upcomingConsultations = appointments.filter(a => a.status === 'scheduled').length;

  // 2. Budget distribution by interest area
  const budgetByInterest = leads.reduce((acc, lead) => {
    if (lead.status === 'closed_lost') return acc;
    const key = lead.interest_area || 'Unassigned';
    acc[key] = (acc[key] || 0) + lead.investment_budget;
    return acc;
  }, {} as Record<string, number>);

  const interestSegments = Object.entries(budgetByInterest).map(([name, value]) => ({
    name,
    value,
    percentage: totalPipelineBudget > 0 ? Math.round((value / totalPipelineBudget) * 100) : 0,
  })).sort((a, b) => b.value - a.value);

  // 3. Format Currency Helper (Indian Rupees)
  const formatINR = (val: number) => {
    if (val >= 10000000) { // 1 Crore
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) { // 1 Lakh
      return `₹${(val / 100000).toFixed(1)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // 4. Get active upcoming appointments
  const upcomingMeetings = [...appointments]
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in" id="overview-dashboard">
      
      {/* Prime Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 bg-amber-500/10 border border-amber-500/20 rounded font-mono text-[10px] text-amber-400 font-semibold uppercase">
            Internal Operations Terminal
          </div>
          <h2 className="font-display text-2xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            Advisor Console Workspace
            <Sparkles className="h-4.5 w-4.5 text-amber-500" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official dashboard for the Principal Advisor. Track internal lead acquisition, prospect budgets, and senior briefing timetables.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-350 text-[11px]">Private CRM Network Live</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards">
        
        {/* KPI: Pipeline Value */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">AUM Prospect Pool</span>
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/10 text-amber-500">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-2xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
              {formatINR(totalPipelineBudget)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">+12.4% this cycle</span>
            </div>
          </div>
        </div>

        {/* KPI: Leads Pool */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Consulting Leads</span>
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/10 text-blue-400">
              <Users2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-2xl font-bold text-slate-100">
              {activeLeadsCount} <span className="text-xs text-slate-500 font-normal">Active</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-slate-400 font-medium">Out of {leads.length} total profiles</span>
            </div>
          </div>
        </div>

        {/* KPI: Upcoming Appointments */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Pending Briefings</span>
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/10 text-purple-450">
              <CalendarDays className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-2xl font-bold text-slate-100">
              {upcomingConsultations} <span className="text-xs text-slate-500 font-normal">Schedules</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-purple-400 font-semibold font-mono">Next briefing tomorrow</span>
            </div>
          </div>
        </div>

        {/* KPI: Success Rate */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-display">Advisory Onboarding</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/10 text-emerald-400">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-2xl font-bold text-slate-100">
              {conversionRate}% <span className="text-xs text-slate-500 font-normal">Conversion</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${conversionRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main analytical grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* allocation details breakdown */}
        <div className="bg-[#0c0d12] border border-slate-800 p-6 rounded-2xl lg:col-span-3 flex flex-col justify-between" id="allocation-analysis">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Client Portfolio Segments</h3>
                <p className="text-[11px] text-slate-400">Budget volume breakdown categorized by area of advisory interest.</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-amber-500 font-semibold shrink-0">
                AUM Distribution
              </span>
            </div>

            {interestSegments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active prospecting budget registered yet. Add leads to view allocation.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {interestSegments.map((item, idx) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-4">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                          idx === 0 ? 'bg-amber-500' :
                          idx === 1 ? 'bg-emerald-500' :
                          idx === 2 ? 'bg-indigo-500' : 'bg-slate-500'
                        }`} />
                        <span className="font-medium text-slate-300 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono text-slate-400">
                        <span>{formatINR(item.value)}</span>
                        <span className="text-[10px] font-semibold text-slate-300 w-8 text-right bg-slate-950 border border-slate-800 px-1 py-0.5 rounded">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Segment Line */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div className={`h-full rounded-full ${
                        idx === 0 ? 'bg-amber-500' :
                        idx === 1 ? 'bg-emerald-500' :
                        idx === 2 ? 'bg-indigo-500' : 'bg-slate-500'
                      }`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-5 bg-gradient-to-r from-slate-900/50 to-transparent p-4 rounded-xl border border-slate-800/40 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-400">Onboarding pipeline is healthy.</p>
              <p className="text-xs font-semibold text-slate-300">Ready to initiate new advisory contracts.</p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-[11px] text-amber-500 hover:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1 transition-all bg-amber-500/5 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 cursor-pointer"
            >
              <span>Add clients</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* upcoming schedule checklist */}
        <div className="bg-[#0c0d12] border border-slate-800 p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between" id="schedule-quickview">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Next Consultations</h3>
                <p className="text-[11px] text-slate-400">Earliest scheduled meetings on client files.</p>
              </div>
              <button
                onClick={() => setActiveTab('appointments')}
                className="text-[10px] text-slate-400 hover:text-amber-500 font-medium tracking-wide border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 duration-150 py-1 px-2.5 rounded-lg shrink-0 cursor-pointer"
              >
                Launch Grid
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No upcoming consultations registered. Click below to book.
              </div>
            ) : (
              <div className="space-y-3.5 pt-2">
                {upcomingMeetings.map((app) => {
                  const scheduleDate = new Date(app.scheduled_time);
                  const isToday = scheduleDate.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={app.id} 
                      className={`p-3 rounded-xl border flex flex-col justify-between hover:border-slate-700 hover:bg-[#10121a] duration-150 ${
                        isToday ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-900/40 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{app.lead_name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium block truncate mt-0.5">{app.consultant_name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wider block font-mono ${
                            isToday ? 'bg-amber-500/25 text-amber-300' : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}>
                            {isToday ? 'TODAY' : scheduleDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold block font-mono mt-1">
                            {scheduleDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {app.notes && (
                        <p className="text-[10px] text-slate-400 border-t border-slate-800/60 mt-2 pt-2 truncate italic leading-normal">
                          "{app.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={() => setActiveTab('appointments')}
              className="w-full py-2.5 px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CalendarDays className="h-4 w-4 text-amber-500" />
              <span>Schedule New consultation</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
