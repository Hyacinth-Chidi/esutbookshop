'use client';

import { useState, useEffect, useRef } from 'react';
import { useSubAdmins, useCreateSubAdmin, useDeleteSubAdmin } from '@/hooks/useAdmin';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, UserPlus, MoreVertical } from 'lucide-react';

// Actions Dropdown Component
function ActionsDropdown({ subAdmin, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
          <MoreVertical className="w-4 h-4 text-neutral-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onDelete(subAdmin)}
          className="text-error focus:bg-error/10 focus:text-error"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SubAdminsPage() {
  const { isAdmin } = useAdminAuth();
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, subAdmin: null });
  const [formData, setFormData] = useState({ username: '', email: '' });

  // TanStack Query hooks
  const { data: subAdmins = [], isLoading } = useSubAdmins();
  const createSubAdminMutation = useCreateSubAdmin();
  const deleteSubAdminMutation = useDeleteSubAdmin();

  const handleCreate = async (e) => {
    e.preventDefault();
    createSubAdminMutation.mutate(formData, {
      onSuccess: () => {
        setCreateModal(false);
        setFormData({ username: '', email: '' });
      },
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, subAdmin: null });
  };

  const handleDelete = async () => {
    deleteSubAdminMutation.mutate(deleteModal.subAdmin.id, {
      onSuccess: () => {
        closeDeleteModal();
      },
    });
  };

  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-error font-medium">Access Denied</p>
          <p className="text-neutral-700 mt-2 text-sm sm:text-base">Only main admins can manage sub-admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Sub-Admins</h1>
        <Button variant="default" onClick={() => setCreateModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add Sub-Admin
        </Button>
      </div>

      {/* Sub-Admins Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 sm:px-4 py-2.5 text-left text-xs sm:text-sm font-semibold text-neutral-700">Username</th>
                <th className="px-3 sm:px-4 py-2.5 text-left text-xs sm:text-sm font-semibold text-neutral-700 hidden sm:table-cell">Email</th>
                <th className="px-3 sm:px-4 py-2.5 text-left text-xs sm:text-sm font-semibold text-neutral-700 hidden md:table-cell">Created</th>
                <th className="px-3 sm:px-4 py-2.5 text-right text-xs sm:text-sm font-semibold text-neutral-700 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-neutral-500 text-sm">
                    Loading sub-admins...
                  </td>
                </tr>
              ) : subAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-neutral-500 text-sm">
                    No sub-admins found
                  </td>
                </tr>
              ) : (
                subAdmins.map((subAdmin) => (
                  <tr key={subAdmin.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="font-medium text-neutral-900 text-sm">{subAdmin.username}</div>
                      <div className="text-xs text-neutral-500 sm:hidden truncate max-w-[180px]">{subAdmin.email}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-sm text-neutral-700 hidden sm:table-cell">
                      <span className="truncate block max-w-[200px]">{subAdmin.email}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-sm text-neutral-700 hidden md:table-cell">
                      {formatDate(subAdmin.createdAt)}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-right">
                      <ActionsDropdown
                        subAdmin={subAdmin}
                        onDelete={(subAdmin) => setDeleteModal({ isOpen: true, subAdmin })}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Sub-Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter email"
              />
            </div>
            <div className="bg-info/10 border border-info/20 rounded-lg p-3 sm:p-4 mt-4">
              <p className="text-xs sm:text-sm text-info">
                A temporary password will be generated and sent to the provided email address.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={createSubAdminMutation.isPending} className="w-full sm:w-auto">
                {createSubAdminMutation.isPending ? <span className="animate-spin mr-2">⏳</span> : <UserPlus className="w-4 h-4 mr-2" />}
                Create Sub-Admin
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={`Delete Sub-Admin?`}
        description={`Are you sure you want to delete ${deleteModal.subAdmin?.username || 'this sub-admin'}? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteSubAdminMutation.isPending}
      />
    </div>
  );
}