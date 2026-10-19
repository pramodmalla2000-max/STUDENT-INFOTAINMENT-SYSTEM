import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, GraduationCap, Calendar, Building, ExternalLink, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const CertificateVerifyPage: React.FC = () => {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const [cert, setCert] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/certificates/verify/${certificateNumber}`);
        if (res.success && res.data) {
          setCert(res.data);
        } else {
          setError(res.message || 'Invalid or unregistered certificate credential.');
        }
      } catch (e: any) {
        setError(e.message || 'Certificate verification query failed.');
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [certificateNumber]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-12 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to University Portal
          </Link>
          <span className="text-[11px] font-mono text-slate-400">Institutional Public Registry</span>
        </div>

        {isLoading ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            <LoadingSpinner size="lg" label="Querying Institutional Blockchain & Credential Registry..." />
          </div>
        ) : error || !cert ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Certificate Not Found</h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm mx-auto">{error}</p>
            <p className="text-[11px] text-slate-400">
              Credential identifier <span className="font-mono font-bold">{certificateNumber}</span> was not found in the verified university registry.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Verified Badge Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Authentic Verified Credential
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    #{cert.certificateNumber}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                STATUS: VERIFIED
              </span>
            </div>

            {/* Certificate Meta */}
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {cert.category}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 leading-snug">
                {cert.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Issued by: <strong className="text-slate-800 dark:text-slate-200">{cert.issuingOrganization}</strong>
              </p>
            </div>

            {/* Recipient Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Recipient Details</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Student Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {cert.student?.personalInfo?.fullName || 'Enrolled Student'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">University ID</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {cert.student?.studentId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cert.student?.academicInfo?.department?.name || cert.student?.academicInfo?.branch}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Issue Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(cert.issueDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
              Verified by Apex Institute of Technology & Science • Student Infotainment Registry
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
