import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface ExtractionProgress {
  status: string;
  totalResults?: number;
  currentIndex?: number;
  percentage?: number;
  message?: string;
}

interface ExtractionComplete {
  status: string;
  totalResults: number;
}

interface ExtractionError {
  message: string;
}

export function useExtractionSocket(extractionId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!extractionId) return;

    // Get API URL from environment or default to localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

    // Create socket connection
    const newSocket = io(apiUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Set up event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on(`extraction:${extractionId}:progress`, (data: ExtractionProgress) => {
      console.log("Progress update:", data);
      setProgress(data);
    });

    newSocket.on(`extraction:${extractionId}:complete`, (data: ExtractionComplete) => {
      console.log("Extraction complete:", data);
      setProgress({
        status: data.status,
        totalResults: data.totalResults,
        percentage: 100,
        message: `Completed! Extracted ${data.totalResults} results`,
      });
      setIsComplete(true);
    });

    newSocket.on(`extraction:${extractionId}:error`, (data: ExtractionError) => {
      console.error("Extraction error:", data);
      setError(data.message);
    });

    setSocket(newSocket);

    // Cleanup on unmount or when extractionId changes
    return () => {
      newSocket.close();
    };
  }, [extractionId]);

  const reset = useCallback(() => {
    setProgress(null);
    setIsComplete(false);
    setError(null);
  }, []);

  return {
    socket,
    progress,
    isComplete,
    error,
    reset,
  };
}
