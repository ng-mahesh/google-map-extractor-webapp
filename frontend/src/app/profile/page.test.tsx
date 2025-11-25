import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ProfilePage from "./page";
import { authAPI } from "@/lib/api";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

jest.mock("@/lib/api", () => ({
  authAPI: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
  uploadAPI: {
    uploadProfileImage: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("ProfilePage", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockProfile = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    phone: "+1234567890",
    profileImage: "/uploads/profile-images/profile-123.jpg",
    dailyQuota: 100,
    usedQuotaToday: 25,
    quotaResetDate: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (authAPI.getProfile as jest.Mock).mockResolvedValue({ data: mockProfile });

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "user") {
        return JSON.stringify(mockProfile);
      }
      return null;
    });
    Storage.prototype.setItem = jest.fn();
  });

  it("should render loading state initially", () => {
    render(<ProfilePage />);
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("should fetch and display profile data", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Account Settings")).toBeInTheDocument();
    });

    // Email and name appear in the page
    expect(screen.getAllByText(mockProfile.email).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(mockProfile.name).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(mockProfile.phone)).toBeInTheDocument();
  });

  it("should show personal info section", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Personal info")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Basic info and options to manage it. You can make some of this info visible to others."
      )
    ).toBeInTheDocument();
  });

  it("should show quota information", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Daily extraction quota")).toBeInTheDocument();
    });

    expect(screen.getByText(mockProfile.dailyQuota.toString())).toBeInTheDocument();
    expect(screen.getByText(mockProfile.usedQuotaToday.toString())).toBeInTheDocument();
    expect(screen.getByText("75 extractions remaining")).toBeInTheDocument();
  });

  it("should show account info section", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Account info")).toBeInTheDocument();
    });

    expect(screen.getByText("Information about your usage and limits")).toBeInTheDocument();
  });

  it("should display email as read-only", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Account Settings")).toBeInTheDocument();
    });

    expect(screen.getByText("Email cannot be changed")).toBeInTheDocument();
  });

  it("should show danger zone section", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Danger zone")).toBeInTheDocument();
    });

    expect(screen.getByText("Irreversible actions")).toBeInTheDocument();
    expect(screen.getByText("Delete Account")).toBeInTheDocument();
  });

  it("should show delete account button with description", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Delete account")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Permanently delete your account and all associated data")
    ).toBeInTheDocument();
  });

  it("should have dashboard navigation button", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  it("should display profile picture section", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Profile picture")).toBeInTheDocument();
    });

    expect(
      screen.getByText("A profile picture helps personalize your account")
    ).toBeInTheDocument();
  });

  it("should render all main sections", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Account Settings")).toBeInTheDocument();
    });

    // Verify all sections are present
    expect(screen.getByText("Personal info")).toBeInTheDocument();
    expect(screen.getByText("Account info")).toBeInTheDocument();
    expect(screen.getByText("Danger zone")).toBeInTheDocument();
  });

  it("should call getProfile API on mount", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(authAPI.getProfile).toHaveBeenCalled();
    });
  });

  it("should display user name in header", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText(mockProfile.name).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should display user email in header", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText(mockProfile.email).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should show quota progress information", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Total quota")).toBeInTheDocument();
      expect(screen.getByText("Used today")).toBeInTheDocument();
    });
  });
});
