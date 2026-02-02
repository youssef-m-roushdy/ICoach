// server/src/services/socketService.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';

interface UserSocket {
  odId: string;
  socket: Socket;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Socket> = new Map(); // Map userId to socket

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:8081',
          'http://localhost:19000',
          'http://localhost:19001',
          'exp://localhost:8081',
          'exp://192.168.1.6:8081',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    console.log('🔌 Socket.IO server initialized');

    return this.io;
  }

  /**
   * Setup connection and event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 New socket connection: ${socket.id}`);

      // Handle user registration (associate userId with socket)
      socket.on('register', (userId: string) => {
        if (userId) {
          this.userSockets.set(userId, socket);
          socket.data.userId = userId;
          console.log(`✅ User ${userId} registered with socket ${socket.id}`);
          
          // Send confirmation back to client
          socket.emit('registered', { 
            success: true, 
            message: 'Successfully connected to real-time updates' 
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        const userId = socket.data.userId;
        if (userId) {
          this.userSockets.delete(userId);
          console.log(`🔌 User ${userId} disconnected: ${reason}`);
        } else {
          console.log(`🔌 Socket ${socket.id} disconnected: ${reason}`);
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Emit email verified event to specific user
   */
  emitEmailVerified(userId: string, userData: {
    id: string;
    email: string;
    isEmailVerified: boolean;
    firstName?: string;
  }): boolean {
    const socket = this.userSockets.get(userId);
    
    if (socket && socket.connected) {
      socket.emit('email_verified', {
        success: true,
        message: 'Your email has been verified successfully!',
        user: userData,
      });
      console.log(`📧 Email verified event sent to user ${userId}`);
      return true;
    }
    
    console.log(`⚠️ User ${userId} not connected, cannot send email_verified event`);
    return false;
  }

  /**
   * Emit a custom event to a specific user
   */
  emitToUser(userId: string, event: string, data: any): boolean {
    const socket = this.userSockets.get(userId);
    
    if (socket && socket.connected) {
      socket.emit(event, data);
      console.log(`📤 Event '${event}' sent to user ${userId}`);
      return true;
    }
    
    console.log(`⚠️ User ${userId} not connected, cannot send event '${event}'`);
    return false;
  }

  /**
   * Broadcast event to all connected users
   */
  broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📢 Broadcast event '${event}' to all users`);
    }
  }

  /**
   * Get the Socket.IO server instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Check if a user is connected
   */
  isUserConnected(userId: string): boolean {
    const socket = this.userSockets.get(userId);
    return socket?.connected ?? false;
  }

  /**
   * Get count of connected users
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }
}

// Export singleton instance
export const socketService = new SocketService();
