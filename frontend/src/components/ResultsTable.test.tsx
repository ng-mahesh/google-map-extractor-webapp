import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResultsTable from "./ResultsTable";
import { extractionAPI, Extraction } from "@/lib/api";
import toast from "react-hot-toast";

// Mock the API module
jest.mock("@/lib/api", () => ({
  extractionAPI: {
    exportToCSV: jest.fn(),
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

// Mock window.scrollTo
global.scrollTo = jest.fn();

describe("ResultsTable", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Ensure DOM is clean
    document.body.innerHTML = "";
  });

  afterEach(() => {
    // Clean up DOM after each test
    document.body.innerHTML = "";
  });

  const mockExtraction: Extraction = {
    _id: "extraction-123",
    userId: "user-123",
    keyword: "restaurants NYC",
    status: "completed",
    totalResults: 3,
    duplicatesSkipped: 1,
    withoutPhoneSkipped: 0,
    withoutWebsiteSkipped: 1,
    skipDuplicates: true,
    skipWithoutPhone: true,
    results: [
      {
        category: "Restaurant",
        name: "Joe's Pizza",
        address: "123 Main St, New York, NY",
        phone: "+1 555-1234",
        email: "info@joespizza.com",
        website: "https://joespizza.com",
        rating: 4.5,
        reviewsCount: 120,
        reviews: [],
        openingHours: ["Mon-Fri 9AM-10PM"],
        placeId: "place-1",
        isOpen: true,
      },
      {
        category: "Cafe",
        name: "Coffee Shop",
        address: "456 Park Ave, New York, NY",
        phone: "",
        email: "",
        website: "",
        rating: 4.0,
        reviewsCount: 50,
        reviews: [],
        openingHours: [],
        placeId: "place-2",
        isOpen: false,
      },
      {
        category: "Restaurant",
        name: "Sushi Bar",
        address: "789 Broadway, New York, NY",
        phone: "+1 555-5678",
        email: "contact@sushibar.com",
        website: "https://sushibar.com",
        rating: 4.8,
        reviewsCount: 200,
        reviews: [],
        openingHours: [],
        placeId: "place-3",
        isOpen: true,
      },
    ],
    startedAt: "2024-01-01T10:00:00.000Z",
    completedAt: "2024-01-01T10:05:00.000Z",
    createdAt: "2024-01-01T10:00:00.000Z",
    updatedAt: "2024-01-01T10:05:00.000Z",
  };

  it("should render results table with data", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    expect(screen.getByText("restaurants NYC")).toBeInTheDocument();
    expect(screen.getByText("Joe's Pizza")).toBeInTheDocument();
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    expect(screen.getByText("Sushi Bar")).toBeInTheDocument();
  });

  it("should display extraction statistics", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    expect(screen.getByText(/3 results found/i)).toBeInTheDocument();
    expect(screen.getByText(/1 duplicates skipped/i)).toBeInTheDocument();
    expect(screen.getByText(/1 without website skipped/i)).toBeInTheDocument();
  });

  it("should filter results by search term", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    const searchInput = screen.getByPlaceholderText(/search results/i);
    fireEvent.change(searchInput, { target: { value: "pizza" } });

    expect(screen.getByText("Joe's Pizza")).toBeInTheDocument();
    expect(screen.queryByText("Coffee Shop")).not.toBeInTheDocument();
    expect(screen.queryByText("Sushi Bar")).not.toBeInTheDocument();
  });

  it("should filter by contact info", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    const contactFilter = screen.getByLabelText(/contact:/i);
    fireEvent.change(contactFilter, { target: { value: "yes" } });

    // Should show Joe's Pizza and Sushi Bar (both have contact)
    expect(screen.getByText("Joe's Pizza")).toBeInTheDocument();
    expect(screen.getByText("Sushi Bar")).toBeInTheDocument();
    // Should not show Coffee Shop (no contact)
    expect(screen.queryByText("Coffee Shop")).not.toBeInTheDocument();
  });

  it("should filter by website", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    const websiteFilter = screen.getByLabelText(/website:/i);
    fireEvent.change(websiteFilter, { target: { value: "no" } });

    // Should only show Coffee Shop (no website)
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    expect(screen.queryByText("Joe's Pizza")).not.toBeInTheDocument();
    expect(screen.queryByText("Sushi Bar")).not.toBeInTheDocument();
  });

  it("should sort by rating high to low", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    const sortSelect = screen.getByLabelText(/sort by:/i);
    fireEvent.change(sortSelect, { target: { value: "rating-high" } });

    // Sushi Bar (4.8) should be first, then Joe's Pizza (4.5), then Coffee Shop (4.0)
    expect(screen.getByText("Sushi Bar")).toBeInTheDocument();
  });

  it("should sort by rating low to high", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    const sortSelect = screen.getByLabelText(/sort by:/i);
    fireEvent.change(sortSelect, { target: { value: "rating-low" } });

    // Coffee Shop (4.0) should be first
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
  });

  it("should change items per page", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    const itemsPerPageSelect = screen.getByLabelText(/show:/i);
    fireEvent.change(itemsPerPageSelect, { target: { value: "25" } });

    expect(itemsPerPageSelect).toHaveValue("25");
  });

  it("should clear all filters", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    // Apply filters
    const contactFilter = screen.getByLabelText(/contact:/i);
    const websiteFilter = screen.getByLabelText(/website:/i);
    const sortSelect = screen.getByLabelText(/sort by:/i);

    fireEvent.change(contactFilter, { target: { value: "yes" } });
    fireEvent.change(websiteFilter, { target: { value: "yes" } });
    fireEvent.change(sortSelect, { target: { value: "rating-high" } });

    // Clear filters button should appear
    const clearButton = screen.getByText(/clear filters/i);
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    // Filters should be reset
    expect(contactFilter).toHaveValue("all");
    expect(websiteFilter).toHaveValue("all");
    expect(sortSelect).toHaveValue("none");
  });

  it("should export CSV successfully", async () => {
    (extractionAPI.exportToCSV as jest.Mock).mockResolvedValue({
      data: "name,address,phone\nJoe's Pizza,123 Main St,+1 555-1234",
    });

    // Render first, before mocking DOM methods
    render(<ResultsTable extraction={mockExtraction} />);

    // Now mock URL.createObjectURL and other browser APIs for CSV download
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    const mockRemove = jest.fn();
    const mockAppendChild = jest.fn();

    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        return {
          click: mockClick,
          remove: mockRemove,
          setAttribute: jest.fn(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }
      return originalCreateElement(tagName);
    });
    const appendChildSpy = jest
      .spyOn(document.body, "appendChild")
      .mockImplementation(mockAppendChild);

    const exportButton = screen.getByRole("button", { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/export as csv/i)).toBeInTheDocument();
    });

    const csvOption = screen.getByText(/export as csv/i);
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(extractionAPI.exportToCSV).toHaveBeenCalledWith("extraction-123");
      expect(toast.success).toHaveBeenCalledWith("CSV exported successfully!");
    });

    // Restore mocks
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });

  it("should handle CSV export failure", async () => {
    (extractionAPI.exportToCSV as jest.Mock).mockRejectedValue(new Error("Export failed"));

    render(<ResultsTable extraction={mockExtraction} />);

    const exportButton = screen.getByRole("button", { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/export as csv/i)).toBeInTheDocument();
    });

    const csvOption = screen.getByText(/export as csv/i);
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to export CSV");
    });
  });

  it("should display no contact info message", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    // Coffee Shop has no phone or email
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
  });

  it("should display rating and review count", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    // Joe's Pizza rating
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

  it("should show no results message when filtered to zero", () => {
    render(<ResultsTable extraction={mockExtraction} />);

    const searchInput = screen.getByPlaceholderText(/search results/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("should paginate results correctly", () => {
    // Create extraction with more results for pagination
    const manyResultsExtraction: Extraction = {
      ...mockExtraction,
      results: Array.from({ length: 25 }, (_, i) => ({
        ...mockExtraction.results[0],
        name: `Restaurant ${i + 1}`,
        placeId: `place-${i}`,
      })),
      totalResults: 25,
    };

    render(<ResultsTable extraction={manyResultsExtraction} />);

    // Should show first 10 results by default
    expect(screen.getByText("Restaurant 1")).toBeInTheDocument();
    expect(screen.getByText("Restaurant 10")).toBeInTheDocument();
    expect(screen.queryByText("Restaurant 11")).not.toBeInTheDocument();

    // Navigate to page 2
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Should show results 11-20
    expect(screen.getByText("Restaurant 11")).toBeInTheDocument();
    expect(screen.getByText("Restaurant 20")).toBeInTheDocument();
    expect(screen.queryByText("Restaurant 10")).not.toBeInTheDocument();
  });

  it("should disable previous button on first page", () => {
    // Create extraction with enough results for pagination
    const paginationExtraction: Extraction = {
      ...mockExtraction,
      results: Array.from({ length: 15 }, (_, i) => ({
        ...mockExtraction.results[0],
        name: `Restaurant ${i + 1}`,
        placeId: `place-${i}`,
      })),
      totalResults: 15,
    };

    render(<ResultsTable extraction={paginationExtraction} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("should display showing info correctly", () => {
    // Create extraction with enough results for pagination
    const paginationExtraction: Extraction = {
      ...mockExtraction,
      results: Array.from({ length: 15 }, (_, i) => ({
        ...mockExtraction.results[0],
        name: `Restaurant ${i + 1}`,
        placeId: `place-${i}`,
      })),
      totalResults: 15,
    };

    render(<ResultsTable extraction={paginationExtraction} />);

    expect(screen.getByText(/showing 1 to 10 of 15 results/i)).toBeInTheDocument();
  });
});
