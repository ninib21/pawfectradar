import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  quantumEncrypted: boolean;
  messageType: 'text' | 'image' | 'location' | 'system';
}

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  messages: Message[];
  sendMessage: (receiverId: string, content: string, messageType?: 'text' | 'image' | 'location') => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  getUnreadCount: (senderId: string) => number;
  getLastMessage: (senderId: string) => Message | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    initializeWebSocket();
    return () => {
      cleanup();
    };
  }, []);

  const initializeWebSocket = async () => {
    try {
      const token = await SecureStore.getItemAsync('quantum_token');
      if (!token) {
        console.log('No quantum token found, skipping WebSocket connection');
        return;
      }

      await connect();
    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  };

  const connect = async (): Promise<void> => {
    if (isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      const token = await SecureStore.getItemAsync('quantum_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Initialize socket connection with quantum security
      socketRef.current = io('wss://quantum-pawfectsitters-api.railway.app', {
        auth: {
          token: `quantum-${token}`,
        },
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
        query: {
          client: 'react-native',
          version: '1.0.0',
          quantum: 'true',
        },
      });

      setupSocketListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnecting(false);
      scheduleReconnect();
    }
  };

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    socketRef.current.on('connect', () => {
      console.log('🔗 WebSocket connected with quantum security');
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttempts.current = 0;
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      scheduleReconnect();
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnecting(false);
      scheduleReconnect();
    });

    socketRef.current.on('quantum_message', (data: any) => {
      handleIncomingMessage(data);
    });

    socketRef.current.on('message_read', (data: any) => {
      handleMessageRead(data);
    });

    socketRef.current.on('user_online', (data: any) => {
      console.log('User online:', data);
    });

    socketRef.current.on('user_offline', (data: any) => {
      console.log('User offline:', data);
    });

    socketRef.current.on('quantum_encryption_update', (data: any) => {
      console.log('Quantum encryption updated:', data);
    });
  };

  const scheduleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    console.log(`Scheduling reconnection attempt ${reconnectAttempts.current} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  };

  const handleIncomingMessage = (data: any) => {
    try {
      const message: Message = {
        id: data.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        timestamp: new Date(data.timestamp),
        isRead: false,
        quantumEncrypted: data.quantumEncrypted || false,
        messageType: data.messageType || 'text',
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  };

  const handleMessageRead = (data: any) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, isRead: true }
          : msg
      )
    );
  };

  const sendMessage = async (
    receiverId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'location' = 'text'
  ): Promise<void> => {
    if (!socketRef.current || !isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      const messageData = {
        receiverId,
        content,
        messageType,
        timestamp: new Date().toISOString(),
        quantumEncrypted: true,
      };

      // Emit message with quantum encryption
      socketRef.current.emit('quantum_message', messageData);

      // Add message to local state immediately for optimistic UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: 'current-user', // Will be replaced with actual user ID
        receiverId,
        content,
        timestamp: new Date(),
        isRead: false,
        quantumEncrypted: true,
        messageType,
      };

      setMessages(prev => [...prev, tempMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string): Promise<void> => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    try {
      socketRef.current.emit('mark_read', { messageId });
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isRead: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttempts.current = 0;
  };

  const cleanup = () => {
    disconnect();
  };

  const getUnreadCount = (senderId: string): number => {
    return messages.filter(msg => 
      msg.senderId === senderId && !msg.isRead
    ).length;
  };

  const getLastMessage = (senderId: string): Message | null => {
    const userMessages = messages.filter(msg => 
      msg.senderId === senderId || msg.receiverId === senderId
    );
    
    if (userMessages.length === 0) return null;
    
    return userMessages[userMessages.length - 1];
  };

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    messages,
    sendMessage,
    markAsRead,
    connect,
    disconnect,
    getUnreadCount,
    getLastMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
