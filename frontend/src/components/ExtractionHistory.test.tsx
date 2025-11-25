import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExtractionHistory from "./ExtractionHistory";
import { extractionAPI } from "@/lib/api";
import type { Extraction } from "@/lib/api";

// Mock the API module
jest.mock("@/lib/api", () => ({
  extractionAPI: {
    getHistory: jest.fn(),
    getExtraction: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn(() => "2024-01-01 10:00"),
}));

describe("ExtractionHistory", () => {
  const mockExtractions: Extraction[] = [
    {
      _id: "1",
      userId: "user1",
      keyword: "restaurants",
      status: "completed",
      results: [],
      totalResults: 50,
      duplicatesSkipped: 5,
      withoutPhoneSkipped: 2,
      skipDuplicates: true,
      skipWithoutPhone: true,
      startedAt: "2024-01-01T10:00:00.000Z",
      completedAt: "2024-01-01T10:05:00.000Z",
      createdAt: "2024-01-01T10:00:00.000Z",
      updatedAt: "2024-01-01T10:05:00.000Z",
    },
    {
      _id: "2",
      userId: "user1",
      keyword: "cafes",
      status: "processing",
      results: [],
      totalResults: 0,
      duplicatesSkipped: 0,
      withoutPhoneSkipped: 0,
      skipDuplicates: false,
      skipWithoutPhone: false,
      startedAt: "2024-01-01T11:00:00.000Z",
      createdAt: "2024-01-01T11:00:00.000Z",
      updatedAt: "2024-01-01T11:00:00.000Z",
    },
    {
      _id: "3",
      userId: "user1",
      keyword: "hotels",
      status: "failed",
      results: [],
      totalResults: 0,
      duplicatesSkipped: 0,
      withoutPhoneSkipped: 0,
      skipDuplicates: false,
      skipWithoutPhone: false,
      errorMessage: "Network error",
      startedAt: "2024-01-01T12:00:00.000Z",
      createdAt: "2024-01-01T12:00:00.000Z",
      updatedAt: "2024-01-01T12:00:00.000Z",
    },
  ];

  const mockOnViewResults = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (extractionAPI.getHistory as jest.Mock).mockResolvedValue({
      data: mockExtractions,
    });
  });

  it("should render extraction list", async () => {
    render(<ExtractionHistory onViewResults={mockOnViewResults} />);

    await waitFor(() => {
      expect(screen.getByText("restaurants")).toBeInTheDocument();
      expect(screen.getByText("cafes")).toBeInTheDocument();
      expect(screen.getByText("hotels")).toBeInTheDocument();
    });
  });

  it("should show empty state when no extractions", async () => {
    (extractionAPI.getHistory as jest.Mock).mockResolvedValue({ data: [] });

    render(<ExtractionHistory onViewResults={mockOnViewResults} />);

    await waitFor(() => {
      expect(screen.getByText("No extraction history yet")).toBeInTheDocument();
    });
  });

  it("should display extraction status badges correctly", async () => {
    render(<ExtractionHistory onViewResults={mockOnViewResults} />);

    await waitFor(() => {
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });

  it("should handle view results click", async () => {
    const mockExtraction = mockExtractions[0];
    (extractionAPI.getExtraction as jest.Mock).mockResolvedValue({
      data: mockExtraction,
    });

    render(<ExtractionHistory onViewResults={mockOnViewResults} />);

    const viewButton = await screen.findByText("View");
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(extractionAPI.getExtraction).toHaveBeenCalledWith("1");
      expect(mockOnViewResults).toHaveBeenCalledWith(mockExtraction);
    });
  });

  it("should show results count for completed extractions", async () => {
    render(<ExtractionHistory onViewResults={mockOnViewResults} />);

    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
    });
  });

  it("should show error message for failed extractions", async () => {
    render(<ExtractionHistory onViewResults={mockOnViewResults} />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should show loading state initially", () => {
    (extractionAPI.getHistory as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ExtractionHistory onViewResults={mockOnViewResults} />);

    expect(screen.getByText("Loading history...")).toBeInTheDocument();
  });
});
