"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authAPI, uploadAPI, UpdateProfileData } from "@/lib/api";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  profileImage: string;
  dailyQuota: number;
  usedQuotaToday: number;
  quotaResetDate: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const userData = response.data;
      setProfile(userData);
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
      });
      setPreviewImage(userData.profileImage || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.phone && !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be valid (e.g., +1234567890 or 1234567890)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      toast.error("Only image files (jpg, jpeg, png, gif, webp) are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      // Upload image
      const response = await uploadAPI.uploadProfileImage(file);
      const { imageUrl } = response.data;

      // Update preview
      setPreviewImage(imageUrl);

      // Update profile with new image
      const updateData: UpdateProfileData = {
        profileImage: imageUrl,
      };

      await authAPI.updateProfile(updateData);

      // Update local profile state
      if (profile) {
        setProfile({ ...profile, profileImage: imageUrl });
      }

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.profileImage = imageUrl;
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const updateData: UpdateProfileData = {
        name: formData.name,
        phone: formData.phone,
      };

      const response = await authAPI.updateProfile(updateData);
      const updatedProfile = response.data;

      setProfile(updatedProfile);

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.name = updatedProfile.name;
        user.phone = updatedProfile.phone;
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <button onClick={() => router.push("/dashboard")} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Base URL without /api for static files
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";
  const profileImageUrl = previewImage
    ? previewImage.startsWith("http")
      ? previewImage
      : `${BASE_URL}${previewImage}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          <button onClick={() => router.push("/dashboard")} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>

        {/* Profile Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            {/* Profile Image Section */}
            <div className="mb-8 flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-google">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <label
                  htmlFor="profile-image-input"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-google hover:bg-blue-600 transition-colors"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </label>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Click the camera icon to upload a new photo
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF or WEBP (max 5MB)</p>
            </div>

            {/* Email (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`input-field ${errors.phone ? "border-red-500" : ""}`}
                placeholder="+1234567890 or 1234567890"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Quota Information */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Daily Quota Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Daily Quota</p>
                  <p className="text-lg font-semibold text-blue-600">{profile.dailyQuota}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Used Today</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.usedQuotaToday}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(profile.usedQuotaToday / profile.dailyQuota) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {profile.dailyQuota - profile.usedQuotaToday} extractions remaining
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                disabled={saving}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
