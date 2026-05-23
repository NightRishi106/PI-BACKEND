import React, { useState } from 'react';
import { Appointment, AppointmentStatus, Lead } from '../types';
import { Calendar, Search, Plus, Trash2, Edit2, X, Clock, User, MessageSquare, ShieldAlert, CircleAlert, Briefcase } from 'lucide-react';

interface AppointmentsManagerProps {
  appointments: Appointment[];
  leads: Lead[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
}

export function AppointmentsManager({
  appointments,
  leads,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment
}: AppointmentsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal / Scheduling states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  // Form Inputs State
  const [formData, setFormData] = useState({
    lead_id: '',
    lead_name: '',
    lead_email: '',
    consultant_name: 'Sarah Pushker (Chief Strategist)',
    scheduled_time: '',
    status: 'scheduled' as AppointmentStatus,
    notes: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Status mapping descriptors
  const statusLabels: Record<AppointmentStatus, { txt: string; bg: string; border: string }> = {
    scheduled: { txt: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-400/20' },
    completed: { txt: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-400/20' },
    cancelled: { txt: 'text-slate-450', bg: 'bg-slate-800/40', border: 'border-slate-800' },
    no_show: { txt: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
  };

  // Filter lists based on lookup constraints
  const filteredApps = appointments.filter(app => {
    const matchesSearch = 
      app.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.consultant_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dynamic selection triggers
  const handleSelectLeadFile = (leadId: string) => {
    const matchedLead = leads.find(l => l.id === leadId);
    if (matchedLead) {
      setFormData(prev => ({
        ...prev,
        lead_id: matchedLead.id,
        lead_name: matchedLead.name,
        lead_email: matchedLead.email
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        lead_id: '',
        lead_name: '',
        lead_email: ''
      }));
    }
  };

  // Open Scheduler Modal
  const handleOpenCreateInput = () => {
    // Default time is set to tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    // Format to yyyy-MM-ddThh:mm for datetime-local input
    const formattedTime = tomorrow.toISOString().substring(0, 16);

    // If leads exist, default to first lead for easy flow
    const firstOption = leads[0];

    setFormData({
      lead_id: firstOption ? firstOption.id : '',
      lead_name: firstOption ? firstOption.name : '',
      lead_email: firstOption ? firstOption.email : '',
      consultant_name: 'Sarah Pushker (Chief Strategist)',
      scheduled_time: formattedTime,
      status: 'scheduled',
      notes: ''
    });
    setFormError(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditInput = (app: Appointment) => {
    // Format date string for datetime-local
    const timeMatch = new Date(app.scheduled_time);
    // Adjusted timezone offset formatting
    const offsetMs = timeMatch.getTimezoneOffset() * 60 * 1000;
    const localTime = new Date(timeMatch.getTime() - offsetMs);
    const formattedTime = localTime.toISOString().substring(0, 16);

    setFormData({
      lead_id: app.lead_id || '',
      lead_name: app.lead_name,
      lead_email: app.lead_email,
      consultant_name: app.consultant_name,
      scheduled_time: formattedTime,
      status: app.status,
      notes: app.notes || ''
    });
    setActiveAppId(app.id);
    setFormError(null);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!formData.lead_name.trim() || !formData.scheduled_time) {
      setFormError('Lead and scheduled briefing time are required.');
      setSaving(false);
      return;
    }

    try {
      // Re-convert datetime-local string to dynamic ISO string
      const dateISO = new Date(formData.scheduled_time).toISOString();

      const payload = {
        lead_id: formData.lead_id || undefined,
        lead_name: formData.lead_name.trim(),
        lead_email: formData.lead_email.trim(),
        consultant_name: formData.consultant_name,
        scheduled_time: dateISO,
        status: formData.status,
        notes: formData.notes.trim()
      };

      if (modalMode === 'create') {
        await onAddAppointment(payload);
      } else if (modalMode === 'edit' && activeAppId) {
        await onUpdateAppointment(activeAppId, payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error saving appointment.');
    } finally {
      setSaving(false);
    }
  };

  // Delete appointment check
  const handleDeleteAppointmentCheck = async (id: string, name: string) => {
    const confirmation = window.confirm(`Remove scheduled consultation with "${name}"?`);
    if (confirmation) {
      try {
        await onDeleteAppointment(id);
      } catch (err: any) {
        alert('Removal failed: ' + err.message);
      }
    }
  };

  const consultants = [
    'Sarah Pushker (Chief Strategist)',
    'Robert Pushker (Real Estate Partner)',
    'Michael Lin (Alternative Markets Associate)',
    'Evelyn Ross (Tax Compliance Advisor)'
  ];

  return (
    <div className="space-y-6" id="appointments-workspace">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded font-mono text-[10px] tracking-wider uppercase mb-1.5 font-semibold">
            Confidential Advisor Schedules
          </div>
          <h2 className="font-display text-2xl font-semibold text-slate-105 tracking-tight">
            Advisor Briefings Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Schedule private portfolio walkthroughs, log advisor feedback checklists, and manage senior strategist assignments.
          </p>
        </div>
        <button
          onClick={handleOpenCreateInput}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold rounded-xl text-xs duration-150 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer select-none"
        >
          <Calendar className="h-4 w-4 text-slate-950" />
          <span>Book Advisor Briefing</span>
        </button>
      </div>

      {/* Toolbar filters row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-205 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
            placeholder="Search files by client name or consultant lead assigned..."
          />
        </div>

        {/* Status selection filter dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
          >
            <option value="all">Filter: All briefings</option>
            <option value="scheduled">Scheduled Planning</option>
            <option value="completed">Completed Briefings</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <Calendar className="h-3 w-3" />
          </div>
        </div>

      </div>

      {/* Main timeline listing table card */}
      <div className="bg-[#0c0d12] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="appointments-stage">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-400 text-[11px] font-mono tracking-wider uppercase">
                <th className="py-4 px-5">Client Name</th>
                <th className="py-4 px-5">Phone</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Service</th>
                <th className="py-4 px-5">Appointment Date</th>
                <th className="py-4 px-5">Created At</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-xs">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    NO MEETINGS REGISTERED UNDER THIS LOOKUP.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const scheduleTime = new Date(app.scheduled_time);
                  const stateBadge = statusLabels[app.status] || { txt: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-800' };
                  
                  // Look up matching lead for phone details
                  const matchedLead = leads.find(l => l.id === app.lead_id);
                  const phone = matchedLead?.phone || 'N/A';
                  const serviceArea = matchedLead?.interest_area || 'Wealth Management';

                  return (
                    <tr key={app.id} className="hover:bg-[#11131c]/50 duration-150 group">
                      {/* Client Name */}
                      <td className="py-4 px-5 font-semibold text-slate-205">
                        {app.lead_name}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-5 text-slate-300 font-mono">
                        {phone}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-5 text-slate-300 font-mono">
                        {app.lead_email}
                      </td>

                      {/* Service / Consultant */}
                      <td className="py-4 px-5">
                        <div className="text-slate-200 font-medium">
                          {serviceArea}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5" title="Strategist Assigned">
                          {app.consultant_name}
                        </div>
                      </td>

                      {/* Appointment Date */}
                      <td className="py-4 px-5 font-mono">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>
                            {scheduleTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-450 mt-0.5">
                          {scheduleTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Today'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${stateBadge.bg} ${stateBadge.txt} ${stateBadge.border}`}>
                          {app.status}
                        </span>
                      </td>

                      {/* notes */}
                      <td className="py-4 px-5 min-w-[180px] max-w-xs">
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 italic">
                          {app.notes ? `"${app.notes}"` : 'No planning notes appended'}
                        </p>
                      </td>

                      {/* operations actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditInput(app)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg duration-150 cursor-pointer"
                            title="Reschedule / Edit info"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointmentCheck(app.id, app.lead_name)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg duration-150 cursor-pointer"
                            title="Delete Schedule"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduler Modal Dialogue */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" id="consultation-modal">
          {/* backdrop blackout panel */}
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[#0d0f17] border border-slate-800/85 rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            
            {/* Modal headers */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                <h3 className="text-md font-semibold text-slate-100">
                  {modalMode === 'create' ? 'Book Investment consultation' : 'Modify Meeting Schedule'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2 text-xs text-red-200">
                <CircleAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Scheduled form fields */}
            <form onSubmit={handleFormSubmission} className="space-y-4">
              
              {/* Linked Client Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Registered Client Lead File *
                </label>
                {modalMode === 'create' ? (
                  leads.length === 0 ? (
                    <div className="p-3 bg-red-950/20 border border-red-500/25 rounded-lg flex items-center gap-2 text-[11px] text-amber-500">
                      <ShieldAlert className="h-4 w-4" />
                      <span>No client leads currently exist. Create a client lead first in the leads tab.</span>
                    </div>
                  ) : (
                    <select
                      value={formData.lead_id}
                      onChange={(e) => handleSelectLeadFile(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 appearance-none"
                    >
                      <option value="">-- Choose Lead Profile --</option>
                      {leads.map(lead => (
                        <option key={lead.id} value={lead.id}>
                          {lead.name} ({lead.interest_area} - Budget: ₹{lead.investment_budget.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  )
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-350 font-mono">
                    {formData.lead_name} ({formData.lead_email})
                  </div>
                )}
              </div>

              {/* If no lead register, let advisor write custom values (Fallback option validation) */}
              {leads.length === 0 && modalMode === 'create' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Advisory Client Name
                    </label>
                    <input
                      type="text"
                      value={formData.lead_name}
                      onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-250 font-sans focus:outline-none"
                      placeholder="e.g. Richard Hendricks"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Client Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.lead_email}
                      onChange={(e) => setFormData({ ...formData, lead_email: e.target.value })}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-250 font-mono focus:outline-none"
                      placeholder="r.hendricks@piedpiper.com"
                    />
                  </div>
                </div>
              )}

              {/* Consultation advisor selection & Agenda status row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Advisory Advisor Assigned
                  </label>
                  <select
                    value={formData.consultant_name}
                    onChange={(e) => setFormData({ ...formData, consultant_name: e.target.value })}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 appearance-none"
                  >
                    {consultants.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Meeting Agenda Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                    className="block w-full px-1 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="scheduled">Scheduled Planning</option>
                    <option value="completed">Completed Advisory</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
              </div>

              {/* Time and Calendar scheduler */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Briefing Date & Time Slot *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>
              </div>

              {/* Briefing notes */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Meeting Agenda & Discussion Blueprint
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 pointer-events-none text-slate-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
                    placeholder="Provide specific notes like 'Walkthrough retirement savings trusts, draft preliminary liquidity strategy, tax deferral parameters...'"
                  />
                </div>
              </div>

            </form>

            <div className="pt-6 border-t border-slate-800 mt-6 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-350 text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
              >
                Back out
              </button>
              <button
                type="button"
                onClick={handleFormSubmission}
                disabled={saving || (leads.length === 0 && !formData.lead_name && modalMode === 'create')}
                className="py-2.5 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-semibold rounded-lg shrink-0 cursor-pointer min-w-28 flex items-center justify-center disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Verify Schedule</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
