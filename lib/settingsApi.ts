import api from './api';

// ============================================
// SYSTEM SETTINGS API
// ============================================

export const getSystemSettings = async () => {
    return await api.get('/settings');
};

export const updateSystemSettings = async (data: Record<string, any>) => {
    return await api.put('/settings', data);
};

// ============================================
// FACULTY & DEPARTMENT API
// ============================================

export const getFaculties = async () => {
    return await api.get('/faculties');
};

export const createFaculty = async (data: Record<string, string>) => {
    return await api.post('/faculties', data);
};

export const deleteFaculty = async (id: string) => {
    return await api.delete(`/faculties/${id}`);
};

export const createDepartment = async (data: Record<string, string>) => {
    return await api.post('/faculties/departments', data);
};

export const deleteDepartment = async (id: string) => {
    return await api.delete(`/faculties/departments/${id}`);
};

// ============================================
// CATEGORY API
// ============================================

export const getCategories = async () => {
    return await api.get('/categories');
};

export const createCategory = async (data: Record<string, string>) => {
    return await api.post('/categories', data);
};

export const deleteCategory = async (id: string) => {
    return await api.delete(`/categories/${id}`);
};
