import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('admin@studentinfotainment.local');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(identifier, password);

      // Redirect intelligently based on user role
      if (loggedInUser.role === 'SUPER_ADMIN' || loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else if (loggedInUser.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (loggedInUser.role === 'PARENT') {
        navigate('/parent/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email/ID and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (roleId: string, rolePass: string) => {
    setIdentifier(roleId);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left Hero Panel: Institutional Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_50%)]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-md flex items-center justify-center text-indigo-300">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">STUDENT INFOTAINMENT</h1>
            <p className="text-xs text-indigo-300 font-medium tracking-widest uppercase">
              Student 360° Management System
            </p>
          </div>
        </div>

        <div className="relative z-10 my-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Unified Campus Intelligence
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white mb-4">
            One Student. One University.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              One Complete Digital Profile.
            </span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Seamlessly interconnecting student academic history, attendance analytics, verifiable credentials,
            examinations, achievements, and grievances across administrators, faculty, students, and parents.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Role-Based Access Control
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Student 360° Profile
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Real-time Attendance & Marks
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verifiable Certificates
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 border-t border-white/10 pt-4 flex items-center justify-between">
          <span>Apex Institute of Technology & Science</span>
          <span>Academic Portal v1.0</span>
        </div>
      </div>

      {/* Right Form Panel: Authentication & Demo Credentials */}
      <div className="lg:w-1/2 p-6 md:p-12 lg:p-16 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Institutional Portal Sign-in</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your registered university email or student roll number to access your portal.
            </p>
          </div>

          {/* Quick Demo Role Selector */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800">
            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> One-Click Demo Accounts:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@studentinfotainment.local', 'Admin@123')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center shadow-xs"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('faculty@studentinfotainment.local', 'Faculty@123')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-center shadow-xs"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('25B21AI024', 'Student@123')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center shadow-xs"
              >
                Student (ID)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('parent@studentinfotainment.local', 'Parent@123')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors text-center shadow-xs"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('superadmin@studentinfotainment.local', 'SuperAdmin@123')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-center shadow-xs col-span-2 sm:col-span-1"
              >
                Super Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email / Student ID / Roll Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 25B21AI024 or admin@aits.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember this workstation
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Default demo password is: Admin@123 / Student@123 / Faculty@123 / Parent@123');
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Student 360</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Public verification shortcut */}
          <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-800 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need to verify a student certificate publicly?{' '}
              <button
                type="button"
                onClick={() => navigate('/verify/certificate/CERT-2026-AITS-10294')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Verify Credential
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
