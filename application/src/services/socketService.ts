// application/src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

interface SocketEvents {
  onEmailVerified?: (data: EmailVerifiedData) => void;
  onConnected?: () => void;
  onDisconnected?: (reason: string) => void;
  onError?: (error: Error) => void;
}

interface EmailVerifiedData {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    isEmailVerified: boolean;
    firstName?: string;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private eventHandlers: SocketEvents = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to the WebSocket server
   */
  connect(userId: string, handlers?: SocketEvents): void {
    if (this.socket?.connected && this.userId === userId) {
      console.log('🔌 Socket already connected for user:', userId);
      return;
    }

    // Disconnect existing socket if any
    this.disconnect();

    this.userId = userId;
    this.eventHandlers = handlers || {};

    // Extract base URL without /api path
    const wsUrl = API_BASE_URL.replace('/api/v1', '').replace('/api', '');
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Register user with server
      if (this.userId) {
        this.socket?.emit('register', this.userId);
      }
      
      this.eventHandlers.onConnected?.();
    });

    // Registration confirmed
    this.socket.on('registered', (data: { success: boolean; message: string }) => {
      console.log('✅ Socket registered:', data.message);
    });

    // Email verified event from server
    this.socket.on('email_verified', (data: EmailVerifiedData) => {
      console.log('📧 Email verified event received:', data);
      this.eventHandlers.onEmailVerified?.(data);
    });

    // Disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket disconnected:', reason);
      this.eventHandlers.onDisconnected?.(reason);
    });

    // Connection error
    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('⚠️ Max reconnection attempts reached');
        this.eventHandlers.onError?.(error);
      }
    });

    // Generic error
    this.socket.on('error', (error: Error) => {
      console.error('❌ Socket error:', error);
      this.eventHandlers.onError?.(error);
    });
  }

  /**
   * Update event handlers
   */
  setEventHandlers(handlers: SocketEvents): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Set email verified handler specifically
   */
  onEmailVerified(handler: (data: EmailVerifiedData) => void): void {
    this.eventHandlers.onEmailVerified = handler;
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('🔌 Socket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
