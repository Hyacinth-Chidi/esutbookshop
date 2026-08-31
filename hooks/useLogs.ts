import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// API Functions
const getInventoryLogs = async (params = {}) => {
  const { data } = await axios.get('/api/admin/logs/inventory', { params });
  return data;
};

const getAuditLogs = async (params = {}) => {
  const { data } = await axios.get('/api/admin/logs/audit', { params });
  return data;
};

// Query Keys
export const logKeys = {
  all: ['logs'],
  inventory: (params: any) => [...logKeys.all, 'inventory', params],
  audit: (params: any) => [...logKeys.all, 'audit', params],
};

// Hooks
export function useInventoryLogs(params = {}) {
  return useQuery({
    queryKey: logKeys.inventory(params),
    queryFn: () => getInventoryLogs(params),
  });
}

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: logKeys.audit(params),
    queryFn: () => getAuditLogs(params),
  });
}
