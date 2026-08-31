'use client';

import { useDashboardStats } from '@/hooks/useAdmin';
import { useFaculties } from '@/hooks/useFaculties';
import { useSystemSettings } from '@/hooks/useSettings';
import StatsCard from '@/components/admin/StatsCard';
import { Status, StatusIndicator, StatusLabel } from '@/components/kibo-ui/status';
import Link from 'next/link';
import { Book, Users, CheckCircle, XCircle, Plus, LayoutGrid, Building2, GraduationCap } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  
  // TanStack Query - fetch dashboard stats
  const { data: stats, isLoading } = useDashboardStats();
  const { data: faculties = [], isLoading: loadingFaculties } = useFaculties();
  const { data: settings } = useSystemSettings();

  // Calculate stats
  const totalFaculties = faculties.length;
  const totalDepartments = faculties.reduce((acc, curr) => acc + (curr.departments?.length || 0), 0);
  
  const loading = isLoading || loadingFaculties;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen relative overflow-hidden">
      {/* Decorative page background glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-info/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 font-medium">
            Welcome back, <span className="text-neutral-900 font-semibold">{admin?.username}</span>! Here's what's happening today.
          </p>
        </div>

        {/* System Status Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          <Status status="online" className="px-3 py-2 bg-white/60 backdrop-blur-sm border-neutral-100 shadow-sm rounded-xl transition-all hover:bg-white/80">
            <StatusIndicator className="animate-pulse" />
            <div className="flex flex-col ml-2">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold leading-tight">Session</span>
              <span className="text-sm font-bold text-neutral-900 leading-tight">{settings?.currentSession || '...'}</span>
            </div>
          </Status>
          
          <Status status="maintenance" className="px-3 py-2 bg-white/60 backdrop-blur-sm border-neutral-100 shadow-sm rounded-xl transition-all hover:bg-white/80">
            <StatusIndicator />
            <div className="flex flex-col ml-2">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold leading-tight">Semester</span>
              <span className="text-sm font-bold text-neutral-900 leading-tight">{settings?.currentSemester || '...'}</span>
            </div>
          </Status>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Materials"
          value={loading ? '...' : stats?.totalBooks ?? 0}
          icon={Book}
          color="primary"
        />
        <StatsCard
          title="Total Faculties"
          value={loading ? '...' : totalFaculties}
          icon={Building2}
          color="warning"
        />
        <StatsCard
          title="Total Departments"
          value={loading ? '...' : totalDepartments}
          icon={GraduationCap}
          color="info"
        />
        {admin?.role === 'admin' && (
          <StatsCard
            title="Sub-Admins"
            value={loading ? '...' : stats?.totalSubAdmins ?? 0}
            icon={Users}
            color="info"
          />
        )}
        <StatsCard
          title="In Stock Materials"
          value={loading ? '...' : stats?.inStockBooks ?? 0}
          icon={CheckCircle}
          color="success"
        />
        <StatsCard
          title="Out of Stock Materials"
          value={loading ? '...' : stats?.outOfStockBooks ?? 0}
          icon={XCircle}
          color="error"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-neutral-100 p-5 sm:p-7 relative overflow-hidden">
        {/* Subtle decorative background line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-info to-success opacity-20" />
        
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-5 flex items-center gap-2">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/books/create"
            className="group relative overflow-hidden p-5 rounded-xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:bg-primary/10" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">Add New Material</p>
                <p className="text-xs text-neutral-500 mt-0.5">Inventory entry</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/books"
            className="group relative overflow-hidden p-5 rounded-xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:bg-info/10" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <LayoutGrid className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">Manage Materials</p>
                <p className="text-xs text-neutral-500 mt-0.5">View & edit catalog</p>
              </div>
            </div>
          </Link>

          {admin?.role === 'admin' && (
            <Link
              href="/admin/sub-admins"
              className="group relative overflow-hidden p-5 rounded-xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:bg-success/10" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Manage Admins</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Staff & privileges</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}