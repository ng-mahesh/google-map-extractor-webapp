/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from "@testing-library/react";
import { ExtractionProvider, useExtraction } from "./ExtractionContext";
import { extractionAPI } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("@/lib/api");
jest.mock("@/lib/socket");
jest.mock("react-hot-toast");

describe("ExtractionContext", () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      removeAllListeners: jest.fn(),
    };

    (getSocket as jest.Mock).mockReturnValue(mockSocket);
    (extractionAPI.getHistory as jest.Mock).mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("useExtraction", () => {
    it("should throw error when used outside of provider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useExtraction());
      }).toThrow("useExtraction must be used within ExtractionProvider");

      console.error = originalError;
    });

    it("should provide context when used within provider", () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      expect(result.current).toHaveProperty("activeExtractions");
      expect(result.current).toHaveProperty("startMonitoring");
      expect(result.current).toHaveProperty("stopMonitoring");
      expect(result.current).toHaveProperty("refreshExtraction");
    });
  });

  describe("ExtractionProvider", () => {
    it("should initialize with empty active extractions", () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      expect(result.current.activeExtractions.size).toBe(0);
    });

    it("should fetch processing extractions on mount", async () => {
      const processingExtractions = [
        { _id: "extraction-1", status: "processing" },
        { _id: "extraction-2", status: "processing" },
      ];

      (extractionAPI.getHistory as jest.Mock).mockResolvedValue({
        data: processingExtractions,
      });

      renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      await waitFor(() => {
        expect(extractionAPI.getHistory).toHaveBeenCalledWith(20);
      });
    });
  });

  describe("startMonitoring", () => {
    it("should add extraction to active extractions", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      await waitFor(() => {
        expect(result.current.activeExtractions.has("extraction-123")).toBe(true);
      });
    });

    it("should set up socket listeners for extraction events", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalledWith(
          "extraction:extraction-123:progress",
          expect.any(Function)
        );
        expect(mockSocket.on).toHaveBeenCalledWith(
          "extraction:extraction-123:complete",
          expect.any(Function)
        );
        expect(mockSocket.on).toHaveBeenCalledWith(
          "extraction:extraction-123:error",
          expect.any(Function)
        );
      });
    });

    it("should update extraction progress when progress event received", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      // Get the progress handler
      const progressCall = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "extraction:extraction-123:progress"
      );
      const progressHandler = progressCall?.[1];

      // Simulate progress event
      act(() => {
        progressHandler({
          status: "processing",
          percentage: 50,
          message: "Processing 5 of 10",
        });
      });

      await waitFor(() => {
        const extraction = result.current.activeExtractions.get("extraction-123");
        expect(extraction?.percentage).toBe(50);
        expect(extraction?.message).toBe("Processing 5 of 10");
      });
    });

    it("should show toast and remove extraction on completion", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      // Get the complete handler
      const completeCall = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "extraction:extraction-123:complete"
      );
      const completeHandler = completeCall?.[1];

      // Simulate completion event
      act(() => {
        completeHandler({
          status: "completed",
          totalResults: 25,
        });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining("Extraction completed! Found 25 results")
        );
        expect(result.current.activeExtractions.has("extraction-123")).toBe(false);
      });
    });

    it("should show toast and remove extraction on error", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      // Get the error handler
      const errorCall = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "extraction:extraction-123:error"
      );
      const errorHandler = errorCall?.[1];

      // Simulate error event
      act(() => {
        errorHandler({
          message: "Network error occurred",
        });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Extraction failed: Network error occurred")
        );
        expect(result.current.activeExtractions.has("extraction-123")).toBe(false);
      });
    });
  });

  describe("stopMonitoring", () => {
    it("should remove extraction from active extractions", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      await waitFor(() => {
        expect(result.current.activeExtractions.has("extraction-123")).toBe(true);
      });

      act(() => {
        result.current.stopMonitoring("extraction-123");
      });

      await waitFor(() => {
        expect(result.current.activeExtractions.has("extraction-123")).toBe(false);
      });
    });

    it("should remove socket listeners for extraction", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      act(() => {
        result.current.stopMonitoring("extraction-123");
      });

      await waitFor(() => {
        expect(mockSocket.off).toHaveBeenCalledWith("extraction:extraction-123:progress");
        expect(mockSocket.off).toHaveBeenCalledWith("extraction:extraction-123:complete");
        expect(mockSocket.off).toHaveBeenCalledWith("extraction:extraction-123:error");
      });
    });
  });

  describe("refreshExtraction", () => {
    it("should start monitoring if extraction is processing", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      (extractionAPI.getExtraction as jest.Mock).mockResolvedValue({
        data: { status: "processing" },
      });

      await act(async () => {
        await result.current.refreshExtraction("extraction-123");
      });

      await waitFor(() => {
        expect(result.current.activeExtractions.has("extraction-123")).toBe(true);
      });
    });

    it("should stop monitoring if extraction is completed", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      // Start monitoring first
      act(() => {
        result.current.startMonitoring("extraction-123");
      });

      (extractionAPI.getExtraction as jest.Mock).mockResolvedValue({
        data: { status: "completed" },
      });

      await act(async () => {
        await result.current.refreshExtraction("extraction-123");
      });

      await waitFor(() => {
        expect(result.current.activeExtractions.has("extraction-123")).toBe(false);
      });
    });

    it("should handle errors gracefully", async () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      const consoleError = jest.spyOn(console, "error").mockImplementation();

      (extractionAPI.getExtraction as jest.Mock).mockRejectedValue(new Error("Network error"));

      await act(async () => {
        await result.current.refreshExtraction("extraction-123");
      });

      expect(consoleError).toHaveBeenCalledWith("Failed to refresh extraction:", expect.any(Error));

      consoleError.mockRestore();
    });
  });

  describe("completion callback", () => {
    it("should support setting completion callback", () => {
      const { result } = renderHook(() => useExtraction(), {
        wrapper: ExtractionProvider,
      });

      const mockCallback = jest.fn();

      act(() => {
        result.current.setOnExtractionComplete?.(mockCallback);
      });

      // Verify the function exists and can be called
      expect(result.current.setOnExtractionComplete).toBeDefined();
      expect(typeof result.current.setOnExtractionComplete).toBe("function");
    });
  });
});
