import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const isProd = import.meta.env.PROD;
const defaultURL = isProd ? "https://rohit-portfolio-baxj.onrender.com" : "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_URL || defaultURL;

const resolveApiUrl = (): string => {
  try {
    const parsed = new URL(API_BASE_URL)
    if (!isProd && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      parsed.hostname = window.location.hostname
    }
    return parsed.toString().replace(/\/$/, '')
  } catch (error) {
    console.error("[API URL Parsing Error]:", error);
    return API_BASE_URL.replace(/\/$/, '')
  }
}

const API_URL = resolveApiUrl()
const BASE_URL = `${API_URL}/api/v1/`

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request Interceptor: Cleanup URLs and prevent double slashes
api.interceptors.request.use((config) => {
  if (config.url) {
    // Remove leading slashes from requested path and any redundant trailing slashes
    config.url = config.url.replace(/^\/+/, '').replace(/\/+$/, '')
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const is401 = error.response?.status === 401
    const url = originalRequest.url || ''
    const isAuthRoute = url.includes('auth/login') || url.includes('auth/refresh')

    // Improved Logging for debugging API issues
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Network Error]: Check if backend is running or CORS is blocked.', {
        baseURL: BASE_URL,
        fullURL: `${BASE_URL}/${url}`,
        error
      })
    }

    if (is401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true
      try {
        await api.post('auth/refresh')
        return api(originalRequest)
      } catch (refreshError) {
        console.error('[Session Expired]: Could not refresh token.', refreshError)
      }
    }

    if (is401) {
      useAuthStore.getState().logout()
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login' && !isAuthRoute) {
        window.location.href = '/admin/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
