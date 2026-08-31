/**
 * ============================================
 * FACULTY QUERY HOOKS
 * ============================================
 * TanStack Query hooks for faculty/department data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { getFaculties, getCategories } from '@/lib/settingsApi';

// Query Keys
export const facultyKeys = {
  all: ['faculties'],
  list: () => [...facultyKeys.all, 'list'],
};

export const categoryKeys = {
  all: ['categories'],
  list: () => [...categoryKeys.all, 'list'],
};

/**
 * Fetch all faculties with their departments
 */
export function useFaculties() {
  return useQuery({
    queryKey: facultyKeys.list(),
    queryFn: getFaculties,
    staleTime: 10 * 60 * 1000, // Cache 10 mins (rarely changes)
    select: (data) => data.data,
  });
}

/**
 * Fetch all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
}
