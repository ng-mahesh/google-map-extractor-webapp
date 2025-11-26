"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { setAuthToken, setUser, isAuthenticated } from "@/lib/auth";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full">
        {/* Google-style Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <MapPin className="w-8 h-8 text-google-blue" />
            <h1 className="text-3xl font-normal text-gray-800">
              <span className="text-google-blue">G</span>
              <span className="text-google-red">o</span>
              <span className="text-google-yellow">o</span>
              <span className="text-google-blue">g</span>
              <span className="text-google-green">l</span>
              <span className="text-google-red">e</span>
              <span className="text-gray-700 ml-1">Maps</span>
            </h1>
          </div>
          <h2 className="text-2xl font-normal text-gray-700 mb-2">Sign in</h2>
          <p className="text-sm text-gray-600">to continue to Maps Extractor</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-google p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-google-blue focus:border-transparent transition-all`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-google-blue focus:border-transparent transition-all`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-google-blue hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-google-blue hover:text-primary-700 font-medium"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure business data extraction tool</p>
        </div>
      </div>
    </div>
  );
}
