import React, { useState, useEffect } from 'react';
import { MessageSquareWarning, Plus, Check, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { Complaint } from '../../types/index.js';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner.js';
import { EmptyState, ErrorState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';

export const ComplaintsList: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal: File Complaint
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academic');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal: Resolve / Update Complaint
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolveStatus, setResolveStatus] = useState('RESOLVED');
  const [resolutionText, setResolutionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/complaints');
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        title: newTitle,
        category: newCategory,
        priority: newPriority,
        description: newDescription,
      });
      if (res.success) {
        setIsNewModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        await fetchComplaints();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsResolving(true);
    try {
      const res = await api.put(`/complaints/${selectedComplaint._id}`, {
        status: resolveStatus,
        resolution: resolutionText,
      });
      if (res.success) {
        setSelectedComplaint(null);
        setResolutionText('');
        await fetchComplaints();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update grievance ticket');
    } finally {
      setIsResolving(false);
    }
  };

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'FACULTY'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Grievance & Redressal Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            File academic, hostel, infrastructure, or technical support tickets and track resolution progress.
          </p>
        </div>

        {user?.role === 'STUDENT' && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> File New Grievance
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchComplaints} />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No Grievance Tickets Found"
            description="All student grievances have been addressed or no tickets have been filed."
          />
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60">
                      {c.category}
                    </span>
                    <Badge variant={c.priority === 'HIGH' || c.priority === 'URGENT' ? 'danger' : 'neutral'} size="sm">
                      {c.priority} Priority
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{c.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Filed by {typeof c.student === 'object' ? (c.student as any)?.personalInfo?.fullName : 'Student'}{' '}
                    on {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'RESOLVED' ? 'success' : c.status === 'REJECTED' ? 'danger' : 'warning'} size="md">
                    {c.status}
                  </Badge>

                  {isStaff && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setResolveStatus(c.status === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS');
                        setResolutionText(c.resolution || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-semibold"
                    >
                      Update / Resolve
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{c.description}</p>

              {c.resolution && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block mb-0.5">Resolution Decision:</span>
                  <span>{c.resolution}</span>
                </div>
              )}

              {/* History trail */}
              {c.history && c.history.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Last activity: {c.history[c.history.length - 1].comment} (
                    {new Date(c.history[c.history.length - 1].updatedAt).toLocaleDateString()})
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* File Grievance Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Submit University Grievance</h3>
            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grievance Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laboratory equipment malfunction during exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Faculty">Faculty Related</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Hostel">Hostel & Mess</option>
                    <option value="Fees">Fees & Accounts</option>
                    <option value="Examination">Examination</option>
                    <option value="Technical">Technical Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the incident, location, course, or issue in detail..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'File Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Resolve Grievance</h3>
            <p className="text-xs text-slate-400 mb-4 truncate">{selectedComplaint.title}</p>
            <form onSubmit={handleResolveComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Update</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Response / Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the administrative finding or resolution for the student..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isResolving ? 'Updating...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
