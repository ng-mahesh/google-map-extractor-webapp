"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getSocket } from "@/lib/socket";
import { extractionAPI, Extraction } from "@/lib/api";
import toast from "react-hot-toast";

interface ExtractionProgress {
  extractionId: string;
  status: string;
  percentage?: number;
  currentIndex?: number;
  totalResults?: number;
  message?: string;
}

interface ExtractionContextType {
  activeExtractions: Map<string, ExtractionProgress>;
  startMonitoring: (extractionId: string) => void;
  stopMonitoring: (extractionId: string) => void;
  refreshExtraction: (extractionId: string) => Promise<void>;
  onExtractionComplete?: () => void;
  setOnExtractionComplete?: (callback: () => void) => void;
}

const ExtractionContext = createContext<ExtractionContextType | undefined>(undefined);

export const ExtractionProvider = ({ children }: { children: ReactNode }) => {
  const [activeExtractions, setActiveExtractions] = useState<Map<string, ExtractionProgress>>(
    new Map()
  );
  const [completionCallback, setCompletionCallback] = useState<(() => void) | undefined>();

  // Initialize socket connection
  useEffect(() => {
    const socket = getSocket();

    // Check for any processing extractions on mount
    const checkProcessingExtractions = async () => {
      try {
        const response = await extractionAPI.getHistory(20);
        const processingExtractions = response.data.filter(
          (ext: Extraction) => ext.status === "processing"
        );

        processingExtractions.forEach((ext: Extraction) => {
          startMonitoring(ext._id);
        });
      } catch (error) {
        console.error("Failed to check processing extractions:", error);
      }
    };

    checkProcessingExtractions();

    return () => {
      // Cleanup listeners when component unmounts
      socket.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMonitoring = useCallback((extractionId: string) => {
    const socket = getSocket();

    // Set initial state
    setActiveExtractions((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(extractionId)) {
        newMap.set(extractionId, {
          extractionId,
          status: "processing",
          message: "Starting extraction...",
        });
      }
      return newMap;
    });

    // Listen for progress updates
    const progressHandler = (progress: Omit<ExtractionProgress, "extractionId">) => {
      setActiveExtractions((prev) => {
        const newMap = new Map(prev);
        newMap.set(extractionId, {
          extractionId,
          ...progress,
        });
        return newMap;
      });
    };

    // Listen for completion
    const completeHandler = (data: { status: string; totalResults: number }) => {
      setActiveExtractions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(extractionId);
        return newMap;
      });

      toast.success(`Extraction completed! Found ${data.totalResults} results.`);

      // Call completion callback if set (to refresh history)
      if (completionCallback) {
        completionCallback();
      }

      // Remove listeners
      socket.off(`extraction:${extractionId}:progress`, progressHandler);
      socket.off(`extraction:${extractionId}:complete`, completeHandler);
      socket.off(`extraction:${extractionId}:error`, errorHandler);
    };

    // Listen for errors
    const errorHandler = (error: { message: string }) => {
      setActiveExtractions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(extractionId);
        return newMap;
      });

      toast.error(`Extraction failed: ${error.message}`);

      // Remove listeners
      socket.off(`extraction:${extractionId}:progress`, progressHandler);
      socket.off(`extraction:${extractionId}:complete`, completeHandler);
      socket.off(`extraction:${extractionId}:error`, errorHandler);
    };

    // Attach listeners
    socket.on(`extraction:${extractionId}:progress`, progressHandler);
    socket.on(`extraction:${extractionId}:complete`, completeHandler);
    socket.on(`extraction:${extractionId}:error`, errorHandler);
  }, []);

  const stopMonitoring = useCallback((extractionId: string) => {
    const socket = getSocket();

    // Remove all listeners for this extraction
    socket.off(`extraction:${extractionId}:progress`);
    socket.off(`extraction:${extractionId}:complete`);
    socket.off(`extraction:${extractionId}:error`);

    // Remove from active extractions
    setActiveExtractions((prev) => {
      const newMap = new Map(prev);
      newMap.delete(extractionId);
      return newMap;
    });
  }, []);

  const refreshExtraction = useCallback(
    async (extractionId: string) => {
      try {
        const response = await extractionAPI.getExtraction(extractionId);
        const extraction = response.data;

        if (extraction.status === "processing") {
          startMonitoring(extractionId);
        } else {
          stopMonitoring(extractionId);
        }
      } catch (error) {
        console.error("Failed to refresh extraction:", error);
      }
    },
    [startMonitoring, stopMonitoring]
  );

  const handleSetCompletionCallback = useCallback((callback: () => void) => {
    setCompletionCallback(() => callback);
  }, []);

  return (
    <ExtractionContext.Provider
      value={{
        activeExtractions,
        startMonitoring,
        stopMonitoring,
        refreshExtraction,
        setOnExtractionComplete: handleSetCompletionCallback,
      }}
    >
      {children}
    </ExtractionContext.Provider>
  );
};

export const useExtraction = () => {
  const context = useContext(ExtractionContext);
  if (!context) {
    throw new Error("useExtraction must be used within ExtractionProvider");
  }
  return context;
};
