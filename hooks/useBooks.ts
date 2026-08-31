/**
 * ============================================
 * BOOK QUERY HOOKS
 * ============================================
 * TanStack Query hooks for book data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getAllBooks, getBookById, getFilterOptions, getReportBooks } from '@/lib/bookApi';
import { createBook, updateBook, deleteBook } from '@/lib/adminApi';
import toast from 'react-hot-toast';

// Query Keys (for easy invalidation)
export const bookKeys = {
  all: ['books'],
  lists: () => [...bookKeys.all, 'list'],
  list: (filters: Record<string, any>) => [...bookKeys.lists(), filters],
  details: () => [...bookKeys.all, 'detail'],
  detail: (id: string) => [...bookKeys.details(), id],
  filterOptions: () => [...bookKeys.all, 'filterOptions'],
  report: (filters: Record<string, any>) => [...bookKeys.all, 'report', filters],
};

/**
 * Fetch all books with filters
 */
export function useBooks(filters: Record<string, any> = {}, options: Record<string, any> = {}) {
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: bookKeys.list(filters),
    queryFn: () => getAllBooks(filters),
    select: (data: any) => ({ books: data.books || data.data || [], pagination: data.pagination }),
    placeholderData: keepPreviousData,
    enabled: Boolean(enabled),
    ...restOptions,
  });
}

/**
 * Fetch single book by ID
 */
export function useBook(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => getBookById(id),
    enabled: !!id, // Only run if id exists
    select: (data) => data.data,
  });
}

/**
 * Fetch filter options (faculties, departments, levels, etc.)
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: bookKeys.filterOptions(),
    queryFn: getFilterOptions,
    staleTime: 10 * 60 * 1000, // Cache for 10 mins (rarely changes)
    select: (data) => data.data,
  });
}

/**
 * Fetch all books for report (no limit)
 */
export function useReportBooks(filters: Record<string, any> = {}, options: Record<string, any> = {}) {
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: bookKeys.report(filters),
    queryFn: () => getReportBooks(filters),
    select: (data) => data.data,
    enabled: Boolean(enabled),
    ...restOptions,
  });
}

/**
 * Create book mutation
 */
export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createBook(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      toast.success('Material created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create material');
    },
  });
}

/**
 * Update book mutation
 */
export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string, formData: FormData }) => updateBook(id, formData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
      toast.success('Material updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update material');
    },
  });
}

/**
 * Delete book mutation
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      toast.success('Material deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete material');
    },
  });
}
