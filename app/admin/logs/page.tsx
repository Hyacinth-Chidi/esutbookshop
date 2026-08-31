'use client';

import { useState } from 'react';
import { useInventoryLogs, useAuditLogs } from '@/hooks/useLogs';
import { Loader2, Package, Activity, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'audit'>('inventory');
  
  // Pagination
  const [invPage, setInvPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const limit = 50;

  const { data: invData, isLoading: invLoading } = useInventoryLogs({ page: invPage, limit });
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({ page: auditPage, limit });

  const inventoryLogs = invData?.data || [];
  const invPagination = invData?.pagination || { totalPages: 1, total: 0 };

  const auditLogs = auditData?.data || [];
  const auditPagination = auditData?.pagination || { totalPages: 1, total: 0 };

  const renderPagination = (page: number, setPage: (p: number) => void, pagination: any) => {
    if (pagination.total === 0) return null;
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-neutral-100 rounded-xl shadow-sm text-xs shrink-0 mt-2">
        <div className="text-neutral-500 font-medium tracking-wide">
          <span className="font-bold text-neutral-900">{Math.min((page - 1) * limit + 1, pagination.total)}</span> -{' '}
          <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of{' '}
          <span className="font-medium">{pagination.total}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm font-medium">Page {page} of {pagination.totalPages}</span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col p-2 sm:p-4 pb-1 sm:pb-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-info/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="relative mb-4 z-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-neutral-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary">
            Activity Logs
          </h1>
          {(invLoading || auditLoading) && <Loader2 className="w-4 h-4 animate-spin text-primary opacity-70" />}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'inventory' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory Logs
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'audit' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            Audit Logs
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-neutral-100 p-1">
        <div className="relative z-10 flex-1 overflow-auto overscroll-contain rounded-xl">
          {activeTab === 'inventory' ? (
            <Table>
              <TableHeader className="bg-neutral-50/80 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-12 text-[11px] font-bold text-neutral-500 uppercase">S/N</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Date</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Material</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Change</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Reason</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-neutral-500 text-sm">Loading logs...</TableCell></TableRow>
                ) : inventoryLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-neutral-500 text-sm">No inventory logs found</TableCell></TableRow>
                ) : (
                  inventoryLogs.map((log: any, index: number) => (
                    <TableRow key={log.id} className="hover:bg-primary/5">
                      <TableCell className="font-mono text-xs text-neutral-400">{(invPage - 1) * limit + index + 1}</TableCell>
                      <TableCell className="text-xs text-neutral-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-neutral-900">
                        {log.book?.title || 'Deleted Material'}
                        {log.book?.courseCode && <span className="block text-[10px] text-neutral-500">{log.book.courseCode}</span>}
                      </TableCell>
                      <TableCell className="text-xs font-bold">
                        <span className={`px-2 py-0.5 rounded-full ${log.change > 0 ? 'bg-success/15 text-success' : log.change < 0 ? 'bg-error/15 text-error' : 'bg-neutral-100 text-neutral-600'}`}>
                          {log.change > 0 ? '+' : ''}{log.change}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-600">{log.reason}</TableCell>
                      <TableCell className="text-xs text-neutral-600">{log.admin?.username || 'Unknown'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-50/80 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-12 text-[11px] font-bold text-neutral-500 uppercase">S/N</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Date</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Action</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Entity</TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-neutral-500 text-sm">Loading logs...</TableCell></TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-neutral-500 text-sm">No audit logs found</TableCell></TableRow>
                ) : (
                  auditLogs.map((log: any, index: number) => (
                    <TableRow key={log.id} className="hover:bg-primary/5">
                      <TableCell className="font-mono text-xs text-neutral-400">{(auditPage - 1) * limit + index + 1}</TableCell>
                      <TableCell className="text-xs text-neutral-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-neutral-900">
                        <span className={`px-2 py-0.5 rounded-full ${
                          log.action === 'CREATE' ? 'bg-success/15 text-success' :
                          log.action === 'DELETE' ? 'bg-error/15 text-error' :
                          'bg-info/15 text-info'
                        }`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-600 font-mono">{log.entity} <span className="text-[10px] text-neutral-400">({log.entityId.slice(0,8)}...)</span></TableCell>
                      <TableCell className="text-xs text-neutral-600">{log.admin?.username || 'Unknown'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!invLoading && activeTab === 'inventory' && renderPagination(invPage, setInvPage, invPagination)}
      {!auditLoading && activeTab === 'audit' && renderPagination(auditPage, setAuditPage, auditPagination)}
    </div>
  );
}
