/**
 * Utility functions for API error handling and formatting
 */

/**
 * Parse error response with meaningful messages
 */
export const parseApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message === 'Network Error') {
    return 'Network error. Check your connection and try again.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Server may be unreachable.';
  }
  return error.message || 'An unexpected error occurred';
};

/**
 * Format timestamp to readable date string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format percentage with specific decimals
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format risk score with color-coding class
 */
export const getRiskScoreClass = (score) => {
  if (score >= 60) return 'text-red-400';
  if (score >= 30) return 'text-amber-400';
  return 'text-emerald-400';
};

/**
 * Get badge class for status
 */
export const getStatusBadgeClass = (fraudulent) => {
  return fraudulent ? 'badge-danger' : 'badge-success';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, length = 30) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Debounce function for search and API calls
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Retry async operation with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Check if email is valid
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Calculate risk level as text
 */
export const getRiskLevelText = (score) => {
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
};
