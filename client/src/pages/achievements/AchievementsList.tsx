import React, { useState, useEffect } from 'react';
import { Award, Plus, CheckCircle2, XCircle, Filter, Calendar } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { Achievement } from '../../types/index.js';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner.js';
import { EmptyState, ErrorState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';

export const AchievementsList: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Hackathon');
  const [newOrg, setNewOrg] = useState('');
  const [newLevel, setNewLevel] = useState('National');
  const [newPosition, setNewPosition] = useState('Winner');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAchievements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('verificationStatus', statusFilter);

      const res = await api.get(`/achievements?${params.toString()}`);
      if (res.success && res.data) {
        setAchievements(res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [categoryFilter, statusFilter]);

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/achievements', {
        title: newTitle,
        category: newCategory,
        organization: newOrg,
        level: newLevel,
        position: newPosition,
        description: newDescription,
        achievementDate: new Date(),
      });

      if (res.success) {
        setIsSubmitModalOpen(false);
        setNewTitle('');
        setNewOrg('');
        setNewDescription('');
        await fetchAchievements();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit achievement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    const remarks = prompt(`Enter ${status} remarks (optional):`) || '';
    try {
      await api.put(`/achievements/${id}/verify`, { status, remarks });
      await fetchAchievements();
    } catch (e: any) {
      alert(e.message || 'Verification update failed');
    }
  };

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'FACULTY'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Achievements & Honors Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institutional verification board for national hackathons, research publications, awards, and sports titles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'STUDENT' && (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" /> Submit Achievement
            </button>
          )}
        </div>
      </div>

      {/* Filter strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Categories</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Research">Research & Papers</option>
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
          <option value="Certification">Certification</option>
          <option value="Competition">Coding Competition</option>
          <option value="Leadership">Leadership</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending Review</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <TableSkeleton rows={6} cols={3} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAchievements} />
        ) : achievements.length === 0 ? (
          <EmptyState title="No Achievements Found" description="No extracurricular achievements match your filter." />
        ) : (
          achievements.map((ach) => (
            <div
              key={ach._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50">
                    {ach.category}
                  </span>
                  <Badge variant={ach.verificationStatus === 'VERIFIED' ? 'success' : ach.verificationStatus === 'REJECTED' ? 'danger' : 'warning'} size="sm">
                    {ach.verificationStatus}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{ach.title}</h4>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  {ach.position} • {ach.organization} ({ach.level})
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {ach.description}
                </p>

                {typeof ach.student === 'object' && (
                  <div className="mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    Student: <strong className="text-slate-700 dark:text-slate-300">{(ach.student as any)?.personalInfo?.fullName}</strong> ({(ach.student as any)?.studentId})
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(ach.achievementDate).toLocaleDateString()}
                </span>

                {isStaff && ach.verificationStatus === 'PENDING' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleVerify(ach._id, 'VERIFIED')}
                      className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(ach._id, 'REJECTED')}
                      className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Achievement Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Submit Student Achievement</h3>
            <form onSubmit={handleCreateAchievement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title / Competition Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACM ICPC Regional Finalist"
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
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Research">Research & Paper</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Certification">Certification</option>
                    <option value="Competition">Competition</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="College">College</option>
                    <option value="District">District</option>
                    <option value="State">State</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization / Host</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AICTE / Ministry of Education"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Position / Rank</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Place Winner"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain project impact, cash prize or credentials..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Faculty Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
