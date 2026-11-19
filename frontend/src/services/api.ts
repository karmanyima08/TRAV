import axios from 'axios';
import {
  User,
  Destination,
  Attraction,
  Itinerary,
  SearchResult,
  CSPResult
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('travora_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Optional: localStorage.removeItem('travora_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const destinationsAPI = {
  list: async (search?: string): Promise<Destination[]> => {
    const res = await api.get('/destinations', { params: { search } });
    return res.data;
  },
  get: async (id: string): Promise<Destination> => {
    const res = await api.get(`/destinations/${id}`);
    return res.data;
  },
  getAttractions: async (id: string, category?: string): Promise<Attraction[]> => {
    const res = await api.get(`/destinations/${id}/attractions`, { params: { category } });
    return res.data;
  },
};

export const tripsAPI = {
  create: async (tripData: any) => {
    const res = await api.post('/trips', tripData);
    return res.data;
  },
  list: async () => {
    const res = await api.get('/trips');
    return res.data;
  },
  get: async (tripId: string) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },
  delete: async (tripId: string) => {
    const res = await api.delete(`/trips/${tripId}`);
    return res.data;
  },
  generateItinerary: async (tripId: string): Promise<Itinerary> => {
    const res = await api.post(`/trips/${tripId}/generate`);
    return res.data;
  },
  getItinerary: async (tripId: string): Promise<Itinerary> => {
    const res = await api.get(`/trips/${tripId}/itinerary`);
    return res.data;
  },
  simulateBudget: async (tripId: string, newBudget: number) => {
    const res = await api.post(`/trips/${tripId}/budget-simulate`, { new_budget: newBudget });
    return res.data;
  },
  recoverActivity: async (tripId: string, activityId: string, reason: string) => {
    const res = await api.put(`/trips/${tripId}/activity/${activityId}/recover`, {
      unavailable_attraction_id: activityId,
      reason,
    });
    return res.data;
  },
};

export const aiAPI = {
  runSearch: async (params: {
    destination: string;
    algorithm: string;
    num_days: number;
    budget: number;
    interests: string[];
    walking_comfort: string;
    transport_preference: string;
  }): Promise<SearchResult> => {
    const res = await api.post('/ai/search', params);
    return res.data;
  },
  runCSP: async (params: {
    destination: string;
    num_days: number;
    budget: number;
    interests: string[];
    walking_comfort: string;
  }): Promise<CSPResult> => {
    const res = await api.post('/ai/csp', params);
    return res.data;
  },
  getAgentStatus: async () => {
    const res = await api.get('/ai/agents/status');
    return res.data;
  },
  getPEAS: async () => {
    const res = await api.get('/ai/peas');
    return res.data;
  },
  groupOptimize: async (payload: {
    destination: string;
    num_days: number;
    budget: number;
    group_members: any[];
  }) => {
    const res = await api.post('/ai/group-optimize', payload);
    return res.data;
  },
};

export default api;

