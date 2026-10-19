import React from 'react';
import { FileText, Download, GraduationCap, CalendarCheck, FileSpreadsheet, Award, MessageSquareWarning } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reports = [
    {
      title: 'Complete Student Master Roster',
      description: 'Comprehensive demographic data, contact info, department, CGPA, attendance and placement statuses.',
      icon: GraduationCap,
      csvEndpoint: '/api/reports/students?format=csv',
      color: 'indigo',
    },
    {
      title: 'Semester Examination Results Summary',
      description: 'Subject-wise marks distribution, credits earned, pass/fail status and SGPA metrics.',
      icon: FileSpreadsheet,
      csvEndpoint: '/api/reports/results?format=csv',
      color: 'emerald',
    },
    {
      title: 'Campus Grievances & Disciplinary Report',
      description: 'Institutional tickets, categories, priorities, resolution timelines and audit actions.',
      icon: MessageSquareWarning,
      csvEndpoint: '/api/reports/complaints',
      color: 'rose',
    },
    {
      title: 'Student Achievements & Competitions Report',
      description: 'National and international hackathons, publications, and awards logged by students.',
      icon: Award,
      csvEndpoint: '/api/reports/achievements',
      color: 'amber',
    },
  ];

  const handleDownload = (endpoint: string) => {
    window.open(endpoint, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Institutional Reports & Data Export Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Export authoritative university records in standard CSV and JSON format for government accreditation and internal audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r, idx) => {
          const Icon = r.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{r.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {r.description}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">Format: CSV / Tabular</span>
                <button
                  onClick={() => handleDownload(r.csvEndpoint)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export Data
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
