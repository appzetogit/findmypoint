import axios from 'axios';
import { API_BASE_URL, BACKEND_ORIGIN } from '../../config';

/**
 * Recursively scans any API response payload and resolves relative /uploads paths
 * to absolute backend URLs. Bypasses File/Blob objects to protect frontend file uploading.
 */
export const resolveUploadsUrls = (obj: any, origin: string): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    if (obj.startsWith('/uploads/') && !obj.startsWith('//') && !obj.startsWith('data:')) {
      const baseOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      return `${baseOrigin}${obj}`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => resolveUploadsUrls(item, origin));
  }
  
  if (typeof obj === 'object') {
    if (obj instanceof Blob || obj instanceof File || (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement)) {
      return obj;
    }
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = resolveUploadsUrls(obj[key], origin);
      }
    }
    return newObj;
  }
  
  return obj;
};

// Create client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Configure Global Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Intercept successful API response and resolve relative paths instantly
    if (response.data) {
      response.data = resolveUploadsUrls(response.data, BACKEND_ORIGIN);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
