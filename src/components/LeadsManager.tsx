import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';
import { Search, Plus, Filter, Edit3, Trash2, Mail, Phone, Circle, X, User, IndianRupee, Sparkles, Building, AlertCircle } from 'lucide-react';

interface LeadsManagerProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id' | 'created_at'>) => Promise<void>;
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

export function LeadsManager({ leads, onAddLead, onUpdateLead, onDeleteLead }: LeadsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [interestFilter, setInterestFilter] = useState<string>('all');

  // Modal / Drawer operations state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  // Form Inputs State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investment_budget: '500000',
    status: 'new' as LeadStatus,
    interest_area: 'Wealth Management',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter Unique Interest Areas from current leads static array
  const interestAreas = Array.from(new Set(leads.map(l => l.interest_area).filter(Boolean)));

  // Status Badge styles map
  const statusBadges: Record<LeadStatus, { label: string; text: string; bg: string; border: string }> = {
    new: { label: 'New Lead', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    contacted: { label: 'Contacted', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    qualified: { label: 'Qualified', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    nurturing: { label: 'Nurturing', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    converted: { label: 'Active Client', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    closed_lost: { label: 'Closed/Lost', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-800' },
  };

  // Filter lists based on user search triggers
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesInterest = interestFilter === 'all' || lead.interest_area === interestFilter;

    return matchesSearch && matchesStatus && matchesInterest;
  });

  // Open Drawer triggers
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      investment_budget: '250000',
      status: 'new',
      interest_area: 'Wealth Management',
      notes: '',
    });
    setFormError(null);
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      investment_budget: lead.investment_budget.toString(),
      status: lead.status,
      interest_area: lead.interest_area || 'Wealth Management',
      notes: lead.notes || '',
    });
    setActiveLeadId(lead.id);
    setFormError(null);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  // Submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and Email are required.');
      setSaving(false);
      return;
    }

    const budgetNum = parseFloat(formData.investment_budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setFormError('Please enter a valid investment pipeline budget.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        investment_budget: budgetNum,
        status: formData.status,
        interest_area: formData.interest_area,
        notes: formData.notes.trim()
      };

      if (drawerMode === 'create') {
        await onAddLead(payload);
      } else if (drawerMode === 'edit' && activeLeadId) {
        await onUpdateLead(activeLeadId, payload);
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error executing request.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Action handler
  const handleDeleteCheck = async (id: string, name: string) => {
    const doubleConfirm = window.confirm(`Permanently archive client lead file "${name}"? This deletes all scheduled consultations associated with them.`);
    if (doubleConfirm) {
      try {
        await onDeleteLead(id);
      } catch (err: any) {
        alert('Deletion failed: ' + err.message);
      }
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="leads-workspace">
      
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded font-mono text-[10px] tracking-wider uppercase mb-1.5 font-semibold">
            Confidential Advisor Logs
          </div>
          <h2 className="font-display text-2xl font-semibold text-slate-105 tracking-tight">
            Advisor Client Leads Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain authorized records of accredited investor budgets, tactical advisory allocations, and target contact files. Not exposed to client reviews.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold rounded-xl text-xs duration-150 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer select-none"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          <span>Log New Client File</span>
        </button>
      </div>

      {/* Filter Toolbar row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-205 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
            placeholder="Search leads by name, email or phone code..."
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
          >
            <option value="all">Filter: All Statuses</option>
            <option value="new">New Prospect</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified Asset</option>
            <option value="nurturing">Nurturing</option>
            <option value="converted">Onboarded Client</option>
            <option value="closed_lost">Closed / Rejected</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <Filter className="h-3 w-3" />
          </div>
        </div>

        {/* Interest Area Filter */}
        <div className="relative">
          <select
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
          >
            <option value="all">Filter: All Interests</option>
            {interestAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <Filter className="h-3 w-3" />
          </div>
        </div>

      </div>

      {/* Main Responsive Table */}
      <div className="bg-[#0c0d12] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-400 text-[11px] font-mono tracking-wider uppercase">
                <th className="py-4 px-5">Name</th>
                <th className="py-4 px-5">Phone</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Message</th>
                <th className="py-4 px-5">Proposed Budget</th>
                <th className="py-4 px-5">Lifecycle Stage</th>
                <th className="py-4 px-5">Created At</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    NO COMPLIANT RECORDS LOCATED. RE-SPECIFY STATUS FILTERS.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const badge = statusBadges[lead.status] || {
                    label: lead.status,
                    text: 'text-slate-400',
                    bg: 'bg-slate-500/10',
                    border: 'border-slate-800',
                  };

                  return (
                    <tr key={lead.id} className="hover:bg-[#11131c]/50 duration-150 group">
                      {/* Name */}
                      <td className="py-4 px-5 font-semibold text-slate-200">
                        {lead.name}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-5 text-slate-300 font-mono">
                        {lead.phone || <span className="text-slate-600">N/A</span>}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-5 text-slate-300 font-mono">
                        {lead.email}
                      </td>

                      {/* Message / Notes */}
                      <td className="py-4 px-5 text-slate-400 max-w-[200px] truncate" title={lead.notes}>
                        <div className="italic text-[11px]">
                          {lead.notes || <span className="text-slate-600 font-normal">No notes appended</span>}
                        </div>
                        {lead.interest_area && (
                          <span className="text-[10px] text-amber-500 block mt-0.5">
                            Target: {lead.interest_area}
                          </span>
                        )}
                      </td>

                      {/* proposed budget */}
                      <td className="py-4 px-5 font-mono">
                        <span className="text-slate-200 font-medium">
                          {formatINR(lead.investment_budget)}
                        </span>
                      </td>

                      {/* Status Lifecycle Badge */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold text-[10px] uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <Circle className="h-1.5 w-1.5 fill-current" />
                          {badge.label}
                        </span>
                      </td>

                      {/* Onboard Date */}
                      <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                        {new Date(lead.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Operations buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg duration-150 cursor-pointer"
                            title="Edit Lead File"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCheck(lead.id, lead.name)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg duration-150 cursor-pointer"
                            title="Archive Record"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* SLA Panel Drawer / Overlay Side Form */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="drawer-overlay">
          {/* Black blur overlay backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          <div className="relative w-full max-w-lg h-full bg-[#0b0c11] border-l border-slate-800 shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Building className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-slate-100">
                      {drawerMode === 'create' ? 'Onboard Accredited Prospect' : 'Modify Asset File'}
                    </h3>
                    <p className="text-[10px] text-slate-450 uppercase tracking-wider font-mono">Pushker Portfolio Desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form schema */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Prospect Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                      placeholder="e.g. Sterling Hunt"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Accredited Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                      placeholder="sterling@huntcap.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number Contact
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                      placeholder="+1 (555) 124-5555"
                    />
                  </div>
                </div>

                {/* Proposed Budget */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Allocation Budget Target (Rupees) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500 font-semibold text-xs">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10000"
                      value={formData.investment_budget}
                      onChange={(e) => setFormData({ ...formData, investment_budget: e.target.value })}
                      className="block w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
                      placeholder="e.g. 500000"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Accredited minimum advisory value: ₹25,00,000 Rupees.</span>
                </div>

                {/* status lifecycle dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Consulting Lifecycle Stage
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                      className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 appearance-none"
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified Asset</option>
                      <option value="nurturing">Nurturing</option>
                      <option value="converted">Active Client</option>
                      <option value="closed_lost">Closed / Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Advisory Section
                    </label>
                    <select
                      value={formData.interest_area}
                      onChange={(e) => setFormData({ ...formData, interest_area: e.target.value })}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-300/50 appearance-none"
                    >
                      <option value="Wealth Management">Wealth Management</option>
                      <option value="Real Estate Funds">Real Estate Funds</option>
                      <option value="Retirement & Trust Planning">Retirement & Trust Planning</option>
                      <option value="Tax-Advantaged Mutual Funds">Tax-Advantaged Mutual Funds</option>
                      <option value="Alternative Assets & VC">Alternative Assets & VC</option>
                    </select>
                  </div>
                </div>

                {/* Consulting Portfolio Notes */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Consultant Internal Logs & Notes
                  </label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
                    placeholder="Enter notes on client tax brackets, secondary goals, risk appetite reviews..."
                  />
                </div>
              </form>
            </div>

            {/* Actions footer */}
            <div className="pt-6 border-t border-slate-800 mt-8 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
              >
                Cancel Form
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={saving}
                className="py-2.5 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-lg shrink-0 cursor-pointer min-w-28 flex items-center justify-center disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Commit File</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
