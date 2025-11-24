import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface StartExtractionData {
  keyword: string;
  skipDuplicates?: boolean;
  skipWithoutPhone?: boolean;
  skipWithoutWebsite?: boolean;
  maxResults?: number;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface ExtractedPlace {
  category: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
  openingHours?: string[];
  isOpen?: boolean;
  placeId?: string;
}

export interface Extraction {
  _id: string;
  userId: string;
  keyword: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  results: ExtractedPlace[];
  totalResults: number;
  duplicatesSkipped: number;
  withoutPhoneSkipped: number;
  withoutWebsiteSkipped?: number;
  skipDuplicates: boolean;
  skipWithoutPhone: boolean;
  skipWithoutWebsite?: boolean;
  logs?: string[];
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authAPI = {
  register: (data: RegisterData) => apiClient.post("/auth/register", data),
  login: (data: LoginData) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
};

// Extraction API
export const extractionAPI = {
  startExtraction: (data: StartExtractionData) => apiClient.post("/extraction/start", data),
  getHistory: (limit?: number) =>
    apiClient.get(`/extraction/history${limit ? `?limit=${limit}` : ""}`),
  getExtraction: (id: string) => apiClient.get(`/extraction/${id}`),
  cancelExtraction: (id: string) => apiClient.post(`/extraction/${id}/cancel`),
  exportToCSV: (id: string) => apiClient.get(`/extraction/${id}/export`, { responseType: "blob" }),
  deleteExtraction: (id: string) => apiClient.delete(`/extraction/${id}`),
  getQuota: () => apiClient.get("/extraction/quota"),
};

export default apiClient;
