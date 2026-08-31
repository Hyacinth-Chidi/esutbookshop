import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price to Nigerian Naira
 * @param {number} price - Price to format
 * @param {boolean} showDecimals - Whether to show decimal places (kobo)
 * @returns {string} Formatted price
 */
export const formatPrice = (price: number | null | undefined, showDecimals: boolean = false): string => {
  if (!price && price !== 0) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
};

/**
 * Handle API errors and return user-friendly message
 * @param {Error} error - Error object from API call
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection';
  } else {
    // Other errors
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Generate a URL-friendly slug from text
 * @param {string} text - The main text (e.g. title)
 * @param {string} suffix - Optional suffix to ensure uniqueness (e.g. courseCode)
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (text: string, suffix?: string): string => {
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text

  if (suffix) {
    const suffixSlug = suffix
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
    slug = `${slug}-${suffixSlug}`;
  }

  return slug;
};
