import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import UserProfileMenu from "./UserProfileMenu";

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

describe("UserProfileMenu", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser = {
    name: "Test User",
    email: "test@example.com",
    profileImage: "/uploads/profile-images/test.jpg",
  };

  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should render user profile button", () => {
    render(<UserProfileMenu user={mockUser} onLogout={mockOnLogout} />);

    const button = screen.getByRole("button", { name: /user menu/i });
    expect(button).toBeInTheDocument();
  });

  it("should display user initials when no profile image", () => {
    const userWithoutImage = { ...mockUser, profileImage: undefined };
    render(<UserProfileMenu user={userWithoutImage} onLogout={mockOnLogout} />);

    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("should open menu when profile button is clicked", () => {
    render(<UserProfileMenu user={mockUser} onLogout={mockOnLogout} />);

    const button = screen.getByRole("button", { name: /user menu/i });
    fireEvent.click(button);

    expect(screen.getByText("Hi, Test User!")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Manage your Account")).toBeInTheDocument();
  });

  it("should close menu when clicking outside", async () => {
    render(<UserProfileMenu user={mockUser} onLogout={mockOnLogout} />);

    const button = screen.getByRole("button", { name: /user menu/i });
    fireEvent.click(button);

    expect(screen.getByText("Hi, Test User!")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText("Hi, Test User!")).not.toBeInTheDocument();
    });
  });

  it("should navigate to profile settings", () => {
    render(<UserProfileMenu user={mockUser} onLogout={mockOnLogout} />);

    const button = screen.getByRole("button", { name: /user menu/i });
    fireEvent.click(button);

    const settingsButton = screen.getByText("Profile Settings");
    fireEvent.click(settingsButton);

    expect(mockRouter.push).toHaveBeenCalledWith("/profile");
  });

  it("should call onLogout when sign out is clicked", () => {
    render(<UserProfileMenu user={mockUser} onLogout={mockOnLogout} />);

    const button = screen.getByRole("button", { name: /user menu/i });
    fireEvent.click(button);

    const signOutButton = screen.getByText("Sign out");
    fireEvent.click(signOutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  it("should use email for initials when name is not provided", () => {
    const userWithoutName = { email: "test@example.com", profileImage: undefined };
    render(<UserProfileMenu user={userWithoutName} onLogout={mockOnLogout} />);

    expect(screen.getByText("T")).toBeInTheDocument(); // First letter of email
  });
});
