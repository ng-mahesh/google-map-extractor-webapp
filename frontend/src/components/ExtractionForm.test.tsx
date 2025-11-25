import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExtractionForm from "./ExtractionForm";
import { extractionAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { ExtractionProvider } from "@/contexts/ExtractionContext";

// Mock the API module
jest.mock("@/lib/api", () => ({
  extractionAPI: {
    startExtraction: jest.fn(),
    cancelExtraction: jest.fn(),
    getExtraction: jest.fn(),
    getHistory: jest.fn(() => Promise.resolve({ data: [] })),
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

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

describe("ExtractionForm", () => {
  const mockOnExtractionComplete = jest.fn();

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ExtractionProvider>{component}</ExtractionProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should render the form with default values", () => {
    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    expect(screen.getByPlaceholderText(/search google maps/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start extraction/i })).toBeInTheDocument();
  });

  it("should show error when submitting without keyword", () => {
    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const form = screen.getByRole("button", { name: /start extraction/i }).closest("form");
    fireEvent.submit(form!);

    expect(toast.error).toHaveBeenCalledWith("Please enter a search keyword");
  });

  it("should update keyword input value", () => {
    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const input = screen.getByPlaceholderText(/search google maps/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "restaurants in NYC" } });

    expect(input.value).toBe("restaurants in NYC");
  });

  it("should toggle advanced options", () => {
    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const advancedButton = screen.getByRole("button", { name: /show advanced options/i });

    // Initially hidden
    expect(screen.queryByLabelText(/skip duplicate entries/i)).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(advancedButton);
    expect(screen.getByLabelText(/skip duplicate entries/i)).toBeInTheDocument();

    // Click to hide
    fireEvent.click(advancedButton);
    expect(screen.queryByLabelText(/skip duplicate entries/i)).not.toBeInTheDocument();
  });

  it("should toggle checkboxes in advanced options", () => {
    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    // Show advanced options
    fireEvent.click(screen.getByRole("button", { name: /show advanced options/i }));

    const skipDuplicates = screen.getByLabelText(/skip duplicate entries/i) as HTMLInputElement;
    const skipWithoutPhone = screen.getByLabelText(
      /skip entries without phone/i
    ) as HTMLInputElement;
    const skipWithoutWebsite = screen.getByLabelText(
      /skip entries without website/i
    ) as HTMLInputElement;

    // Check default values
    expect(skipDuplicates.checked).toBe(true);
    expect(skipWithoutPhone.checked).toBe(true);
    expect(skipWithoutWebsite.checked).toBe(false);

    // Toggle checkboxes
    fireEvent.click(skipDuplicates);
    fireEvent.click(skipWithoutWebsite);

    expect(skipDuplicates.checked).toBe(false);
    expect(skipWithoutWebsite.checked).toBe(true);
  });

  it("should update max results slider", () => {
    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    // Show advanced options
    fireEvent.click(screen.getByRole("button", { name: /show advanced options/i }));

    const slider = screen.getByLabelText(/maximum results/i) as HTMLInputElement;
    expect(slider.value).toBe("50");

    fireEvent.change(slider, { target: { value: "80" } });
    expect(slider.value).toBe("80");
  });

  it("should start extraction successfully", async () => {
    (extractionAPI.startExtraction as jest.Mock).mockResolvedValue({
      data: { id: "extraction-123" },
    });

    (extractionAPI.getExtraction as jest.Mock).mockResolvedValue({
      data: {
        status: "completed",
        totalResults: 25,
        logs: ["Extraction started", "Processing..."],
      },
    });

    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const input = screen.getByPlaceholderText(/search google maps/i);
    const submitButton = screen.getByRole("button", { name: /start extraction/i });

    fireEvent.change(input, { target: { value: "coffee shops" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(extractionAPI.startExtraction).toHaveBeenCalledWith({
        keyword: "coffee shops",
        skipDuplicates: true,
        skipWithoutPhone: true,
        skipWithoutWebsite: false,
        maxResults: 50,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Extraction started!"));
    });
  });

  it("should handle extraction failure", async () => {
    (extractionAPI.startExtraction as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: "Quota exceeded",
        },
      },
    });

    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const input = screen.getByPlaceholderText(/search google maps/i);
    const submitButton = screen.getByRole("button", { name: /start extraction/i });

    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Quota exceeded");
    });
  });

  it("should show cancel button when loading", async () => {
    (extractionAPI.startExtraction as jest.Mock).mockResolvedValue({
      data: { id: "extraction-123" },
    });

    (extractionAPI.getExtraction as jest.Mock).mockResolvedValue({
      data: {
        status: "processing",
        logs: [],
      },
    });

    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const input = screen.getByPlaceholderText(/search google maps/i);
    const submitButton = screen.getByRole("button", { name: /start extraction/i });

    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it("should cancel extraction", async () => {
    let extractionIdResolved = false;

    (extractionAPI.startExtraction as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          extractionIdResolved = true;
          resolve({ data: { id: "extraction-123" } });
        }, 100);
      });
    });

    (extractionAPI.getExtraction as jest.Mock).mockResolvedValue({
      data: {
        status: "processing",
        logs: [],
      },
    });

    (extractionAPI.cancelExtraction as jest.Mock).mockResolvedValue({});

    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const input = screen.getByPlaceholderText(/search google maps/i);
    const submitButton = screen.getByRole("button", { name: /start extraction/i });

    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(submitButton);

    // Wait for extraction to start and cancel button to appear
    const cancelButton = await screen.findByRole("button", { name: /cancel/i });

    // Wait for extraction ID to be set in state
    await waitFor(() => {
      expect(extractionIdResolved).toBe(true);
    });

    // Give React time to update state
    await waitFor(() => {
      expect(extractionAPI.startExtraction).toHaveBeenCalled();
    });

    // Click cancel button
    fireEvent.click(cancelButton);

    // Verify cancel was called
    await waitFor(() => {
      expect(extractionAPI.cancelExtraction).toHaveBeenCalledWith("extraction-123");
    });

    expect(toast.success).toHaveBeenCalledWith("Extraction cancelled");
  });

  it("should display progress information when available", async () => {
    (extractionAPI.startExtraction as jest.Mock).mockResolvedValue({
      data: { id: "extraction-123" },
    });

    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const input = screen.getByPlaceholderText(/search google maps/i);
    const submitButton = screen.getByRole("button", { name: /start extraction/i });

    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/starting extraction/i)).toBeInTheDocument();
    });
  });

  it("should disable inputs when loading", async () => {
    (extractionAPI.startExtraction as jest.Mock).mockResolvedValue({
      data: { id: "extraction-123" },
    });

    (extractionAPI.getExtraction as jest.Mock).mockResolvedValue({
      data: {
        status: "processing",
        logs: [],
      },
    });

    renderWithProvider(<ExtractionForm onExtractionComplete={mockOnExtractionComplete} />);

    const input = screen.getByPlaceholderText(/search google maps/i) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /start extraction/i });

    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(input.disabled).toBe(true);
    });
  });
});
