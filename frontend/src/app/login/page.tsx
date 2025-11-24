"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { setAuthToken, setUser } from "@/lib/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { accessToken, refreshToken, user } = response.data;

      setAuthToken(accessToken, refreshToken);
      setUser(user);

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: unknown) {
      let errorMessage = "Login failed. Please check your credentials.";

      interface AxiosError {
        response?: {
          data?: {
            message?: string;
            errors?: string[];
          };
          status?: number;
        };
      }

      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as AxiosError;
        const response = axiosError.response;

        if (response?.data?.message) {
          errorMessage = response.data.message;
        }

        // Handle specific HTTP error codes
        if (response?.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (response?.status === 429) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (response?.status === 400) {
          // Handle validation errors
          if (response.data?.errors && Array.isArray(response.data.errors)) {
            errorMessage = response.data.errors[0];
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Google Maps Extractor</h1>
          <p className="text-gray-600">Extract business data from Google Maps</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`input-field ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`input-field ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
