import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  conversations: Conversation[];
  unreadCount: number;
  sendMessage: (data: { conversationId: string; content: string }) => void;
  markMessageAsRead: (messageId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      const socketBaseUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
      const newSocket = io(socketBaseUrl, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        newSocket.emit('join_conversations');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('new_message', (data: { message: Message; conversationId: string }) => {
        console.log('New message received:', data);
        // Konuşmaları güncelle
        setConversations(prev => 
          prev.map(conv => 
            conv.id === data.conversationId 
              ? { ...conv, messages: [data.message, ...conv.messages], lastMessageTime: data.message.createdAt }
              : conv
          )
        );
        
        // Okunmamış mesaj sayısını güncelle
        if (data.message.sender.id !== user.id) {
          setUnreadCount(prev => prev + 1);
        }
      });

      newSocket.on('message_read', (data: { messageId: string; readBy: string }) => {
        console.log('Message read:', data);
        // Mesajın okundu durumunu güncelle
        setConversations(prev =>
          prev.map(conv => ({
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === data.messageId ? { ...msg, isRead: true } : msg
            )
          }))
        );
      });

      newSocket.on('user_typing', (data: { userId: string; userName: string; conversationId: string }) => {
        console.log('User typing:', data);
        // Typing göstergesi için state güncellemesi yapılabilir
      });

      newSocket.on('user_stopped_typing', (data: { userId: string; conversationId: string }) => {
        console.log('User stopped typing:', data);
        // Typing göstergesi için state güncellemesi yapılabilir
      });

      newSocket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token, user]);

  const sendMessage = (data: { conversationId: string; content: string }) => {
    if (socket && isConnected) {
      socket.emit('send_message', data);
    }
  };

  const markMessageAsRead = (messageId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_message_read', { messageId });
    }
  };

  const startTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    conversations,
    unreadCount,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};







