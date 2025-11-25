"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Settings, LogOut } from "lucide-react";

interface UserProfileMenuProps {
  user: {
    name?: string;
    email: string;
    profileImage?: string;
  };
  onLogout: () => void;
}

export default function UserProfileMenu({ user, onLogout }: UserProfileMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getInitials = () => {
    const name = user.name || user.email;
    return name.charAt(0).toUpperCase();
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";
  const profileImageUrl = user.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `${API_URL}${user.profileImage}`
    : "";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1 transition-colors"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center text-white text-sm font-medium overflow-hidden ring-2 ring-transparent hover:ring-gray-200 transition-all">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt="Profile"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
          {/* User Info Section */}
          <div className="p-4 text-center border-b border-gray-200">
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 rounded-full bg-google-blue flex items-center justify-center text-white text-2xl font-medium overflow-hidden ring-4 ring-blue-100">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Hi, {user.name || "User"}!</h3>
            <p className="text-sm text-gray-600 mb-3">{user.email}</p>
            <button
              onClick={handleProfileClick}
              className="w-full py-2 px-4 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage your Account
            </button>
          </div>

          {/* Menu Options */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-gray-900">Profile Settings</div>
                <div className="text-xs text-gray-500">Update your information</div>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <LogOut className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-gray-900">Sign out</div>
                <div className="text-xs text-gray-500">Sign out of your account</div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-center space-x-4 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-900">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-900">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
