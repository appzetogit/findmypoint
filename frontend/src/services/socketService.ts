import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;
    this.socket = io("http://localhost:5000");

    this.socket.on("connect", () => {
      console.log("WebSocket client connected to server:", this.socket?.id);
      
      // Auto re-register if user details exist in localStorage
      const userStr = localStorage.getItem("fmp_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user._id) {
            this.registerUser(user._id);
          }
        } catch (e) {}
      }
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket client disconnected");
    });
  }

  registerUser(userId: string) {
    this.connect();
    if (this.socket) {
      console.log("Registering user to WebSocket server:", userId);
      this.socket.emit("register_user", userId);
    }
  }

  unregisterUser() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onRequestReview(callback: (data: { bookingId: string; businessId: string; businessName: string; service: string }) => void) {
    this.connect();
    if (this.socket) {
      this.socket.off("request_review"); // Prevent duplicate listeners
      this.socket.on("request_review", callback);
    }
  }
}

export const socketService = new SocketService();
