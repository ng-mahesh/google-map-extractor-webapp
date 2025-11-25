import { getSocket, disconnectSocket } from "./socket";
import { io, Socket } from "socket.io-client";

// Mock socket.io-client
jest.mock("socket.io-client");

describe("socket utility", () => {
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn(),
      id: "test-socket-id",
    };

    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset socket instance
    disconnectSocket();
  });

  describe("getSocket", () => {
    it("should create a new socket connection", () => {
      const socket = getSocket();

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          transports: ["websocket", "polling"],
          reconnection: true,
        })
      );
      expect(socket).toBe(mockSocket);
    });

    it("should return the same socket instance on subsequent calls", () => {
      const socket1 = getSocket();
      const socket2 = getSocket();

      expect(socket1).toBe(socket2);
      expect(io).toHaveBeenCalledTimes(1);
    });

    it("should set up event listeners for connect, disconnect, and connect_error", () => {
      getSocket();

      expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("connect_error", expect.any(Function));
    });

    it("should use correct socket URL from environment or default", () => {
      getSocket();

      const url = (io as jest.Mock).mock.calls[0][0];
      expect(typeof url).toBe("string");
      expect(url).toContain("://");
    });
  });

  describe("disconnectSocket", () => {
    it("should disconnect the socket", () => {
      getSocket();
      disconnectSocket();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it("should allow creating a new socket after disconnect", () => {
      getSocket();
      disconnectSocket();

      jest.clearAllMocks();

      getSocket();

      expect(io).toHaveBeenCalled();
    });

    it("should handle disconnect when socket is not initialized", () => {
      expect(() => disconnectSocket()).not.toThrow();
    });
  });
});
