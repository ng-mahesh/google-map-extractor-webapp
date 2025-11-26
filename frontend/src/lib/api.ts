import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous redirects to login
let isRedirectingToLogin = false;

// Reset the redirect flag when the page loads
if (typeof window !== "undefined") {
  // Reset on page load
  isRedirectingToLogin = false;

  // Also reset when the user navigates back to the page
  window.addEventListener("pageshow", () => {
    isRedirectingToLogin = false;
  });
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
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

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const errorMessage =
        error.response?.data?.message || "Too many requests. Please try again later.";

      // Only show toast if not redirecting and not on auth endpoints
      if (!isRedirectingToLogin && !originalRequest.url?.includes("/auth/")) {
        toast.error(errorMessage);
      }

      return Promise.reject(error);
    }

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          // Try to refresh the token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Prevent multiple redirects
          if (isRedirectingToLogin) {
            return Promise.reject(refreshError);
          }

          isRedirectingToLogin = true;

          // Refresh failed, logout user
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");

          toast.error("Session expired. Please login again.");

          // Use setTimeout to ensure only one redirect happens
          setTimeout(() => {
            window.location.href = "/login";
          }, 100);

          return Promise.reject(refreshError);
        }
      }
    }

    // Show error toast for other errors (excluding auth endpoints to avoid duplicate toasts)
    if (
      typeof window !== "undefined" &&
      !originalRequest.url?.includes("/auth/") &&
      !originalRequest._skipErrorToast &&
      !isRedirectingToLogin &&
      error.response?.status !== 429
    ) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An error occurred";

      toast.error(errorMessage);
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

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface StartExtractionData {
  keyword: string;
  skipDuplicates?: boolean;
  skipWithoutPhone?: boolean;
  skipWithoutWebsite?: boolean;
  skipAlreadyExtracted?: boolean;
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
  description?: string;
  reviewUrl?: string;
  photos?: string[];
  price?: string;
  featuredImage?: string;
  cid?: string;
  kgmid?: string;
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
  alreadyExistsSkipped?: number;
  skipDuplicates: boolean;
  skipWithoutPhone: boolean;
  skipWithoutWebsite?: boolean;
  skipAlreadyExtracted?: boolean;
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
  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refreshToken }),
  refresh: (refreshToken: string) => apiClient.post("/auth/refresh", { refreshToken }),
  getProfile: () => apiClient.get("/auth/profile"),
  updateProfile: (data: UpdateProfileData) => apiClient.put("/auth/profile", data),
};

// Upload API
export const uploadAPI = {
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/upload/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
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
