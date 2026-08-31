/**
 * ============================================
 * BOOK API CALLS
 * ============================================
 * Public book-related API functions
 */

import api from './api';

/**
 * Get all books with filters
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getAllBooks = async (params: Record<string, any> = {}) => {
  return await api.get('/books', { params });
};

/**
 * Get book by ID
 * @param {string} id - Book ID
 * @returns {Promise}
 */
export const getBookById = async (id: string) => {
  return await api.get(`/books/${id}`);
};

/**
 * Get filter options
 * @returns {Promise}
 */
export const getFilterOptions = async () => {
  return await api.get('/books/filters/options');
};

/**
 * Search books
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise}
 */
export const searchBooks = async (query: string, filters: Record<string, any> = {}) => {
  return await api.get('/books', {
    params: { search: query, ...filters },
  });
};

/**
 * Get all books for report (no limit)
 * @param {Object} params - Query parameters (session, semester)
 * @returns {Promise}
 */
export const getReportBooks = async (params: Record<string, any> = {}) => {
  return await api.get('/books/report', { params });
};
