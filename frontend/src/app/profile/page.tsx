"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authAPI, uploadAPI, UpdateProfileData } from "@/lib/api";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Camera,
  Edit2,
  Home,
  Database,
  Trash2,
  ChevronRight,
} from "lucide-react";

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const validateField = (field: string, value: string): string => {
    if (field === "name" && !value.trim()) {
      return "Name is required";
    }
    if (field === "phone" && value && !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(value)) {
      return "Phone number must be valid (e.g., +1234567890 or 1234567890)";
    }
    return "";
  };

  const handleFieldEdit = (field: string) => {
    setEditingField(field);
    setErrors({});
  };

  const handleFieldCancel = () => {
    // Reset to original values
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
    setEditingField(null);
    setErrors({});
  };

  const handleFieldSave = async (field: string) => {
    const value = formData[field as keyof typeof formData];
    const error = validateField(field, value);

    if (error) {
      setErrors({ [field]: error });
      return;
    }

    try {
      setSaving(true);
      const updateData: UpdateProfileData = {
        [field]: value,
      };

      const response = await authAPI.updateProfile(updateData);
      const updatedProfile = response.data;

      setProfile(updatedProfile);

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user[field] = value;
        localStorage.setItem("user", JSON.stringify(user));
      }

      setEditingField(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      toast.error("Only image files (jpg, jpeg, png, gif, webp) are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const response = await uploadAPI.uploadProfileImage(file);
      const { imageUrl } = response.data;

      setPreviewImage(imageUrl);

      const updateData: UpdateProfileData = {
        profileImage: imageUrl,
      };

      await authAPI.updateProfile(updateData);

      if (profile) {
        setProfile({ ...profile, profileImage: imageUrl });
      }

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

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    toast.error("Account deletion is not yet implemented");
    setShowDeleteDialog(false);
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

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";
  const profileImageUrl = previewImage
    ? previewImage.startsWith("http")
      ? previewImage
      : `${BASE_URL}${previewImage}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-google-blue" />
              <h1 className="text-xl font-normal text-gray-900">Account Settings</h1>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-4 ring-blue-100">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="profile-image-input"
                className="absolute bottom-0 right-0 w-8 h-8 bg-google-blue rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 text-white" />
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
            <div className="flex-1">
              <h2 className="text-2xl font-normal text-gray-900 mb-1">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-normal text-gray-900">Personal info</h3>
            <p className="text-sm text-gray-600 mt-1">
              Basic info and options to manage it. You can make some of this info visible to others.
            </p>
          </div>

          {/* Profile Picture */}
          <div className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Camera className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Profile picture</h4>
                  <p className="text-xs text-gray-500">
                    A profile picture helps personalize your account
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <User className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Name</h4>
                  {editingField === "name" ? (
                    <div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your name"
                        autoFocus
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleFieldSave("name")}
                          disabled={saving}
                          className="px-4 py-2 bg-google-blue text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleFieldCancel}
                          disabled={saving}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">{profile.name || "Not set"}</p>
                  )}
                </div>
              </div>
              {editingField !== "name" && (
                <button
                  onClick={() => handleFieldEdit("name")}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Email Field (Read-only) */}
          <div className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Mail className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Email</h4>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Field */}
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Phone className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Phone</h4>
                  {editingField === "phone" ? (
                    <div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="+1234567890 or 1234567890"
                        autoFocus
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleFieldSave("phone")}
                          disabled={saving}
                          className="px-4 py-2 bg-google-blue text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleFieldCancel}
                          disabled={saving}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">{profile.phone || "Not set"}</p>
                  )}
                </div>
              </div>
              {editingField !== "phone" && (
                <button
                  onClick={() => handleFieldEdit("phone")}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-normal text-gray-900">Account info</h3>
            <p className="text-sm text-gray-600 mt-1">Information about your usage and limits</p>
          </div>

          {/* Quota Display */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <Database className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Daily extraction quota</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total quota</p>
                    <p className="text-2xl font-normal text-gray-900">{profile.dailyQuota}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Used today</p>
                    <p className="text-2xl font-normal text-gray-900">{profile.usedQuotaToday}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-google-blue h-2 rounded-full transition-all"
                    style={{
                      width: `${(profile.usedQuotaToday / profile.dailyQuota) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {profile.dailyQuota - profile.usedQuotaToday} extractions remaining
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 mb-6">
          <div className="p-6 border-b border-red-200">
            <h3 className="text-xl font-normal text-red-600">Danger zone</h3>
            <p className="text-sm text-gray-600 mt-1">Irreversible actions</p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Delete account</h4>
                  <p className="text-xs text-gray-500">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fadeIn">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Delete account?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data, including extractions and settings, will
              be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
              >
                Delete permanently
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
