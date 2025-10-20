import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { messagesAPI } from '../../services/api';
import { Conversation, Message, MessageForm } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showError } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      showError('Hata', 'Konuşmalar yüklenirken bir hata oluştu');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await messagesAPI.getMessages(conversationId);
      setMessages(response.data.data || []);
      
      // Mark messages as read - using the correct API method
      // For now, we'll skip this as the API might need adjustment
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Hata', 'Mesajlar yüklenirken bir hata oluştu');
      setMessages([]);
    }
  }, [showError]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const messageData: MessageForm = {
        content: newMessage,
        conversationId: selectedConversation.id
      };
      
      const response = await messagesAPI.sendMessage(messageData);
      setMessages(prev => [...prev, response.data.messageData]);
      setNewMessage('');
      
      // Emit socket event
      if (socket) {
        socket.emit('send_message', {
          conversationId: selectedConversation.id,
          message: response.data.messageData
        });
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      const errorMessage = error.response?.data?.message || 'Mesaj gönderilirken bir hata oluştu';
      showError('Hata', errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleNewMessage = useCallback((data: { conversationId: string; message: Message }) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, data.message]);
    }
    
    // Update conversation list
    setConversations(prev =>
      prev.map(conv =>
        conv.id === data.conversationId
          ? { ...conv, lastMessageTime: data.message.createdAt }
          : conv
      )
    );
  }, [selectedConversation]);

  const handleMessageRead = useCallback((data: { conversationId: string; messageIds: string[] }) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setMessages(prev =>
        prev.map(message =>
          data.messageIds.includes(message.id) ? { ...message, isRead: true } : message
        )
      );
    }
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('message_read', handleMessageRead);

      return () => {
        socket.off('new_message');
        socket.off('message_read');
      };
    }
  }, [socket, selectedConversation, handleNewMessage, handleMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.starter.id === user?.id ? conversation.recipient : conversation.starter;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Mesajlarım
        </h1>
        <p className="text-lg text-gray-600">
          Diğer kullanıcılarla olan konuşmalarınız
        </p>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border dark:border-secondary-700 overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Konuşmalar ({conversations.length})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz konuşmanız yok</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const isSelected = selectedConversation?.id === conversation.id;
                    
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                          isSelected ? 'bg-primary-50 border-primary-200' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {otherUser.firstName} {otherUser.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.ad.title}
                            </p>
                            <div className="flex items-center mt-1">
                              <ClockIcon className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-400">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {getOtherUser(selectedConversation).firstName} {getOtherUser(selectedConversation).lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        İlan: {selectedConversation.ad.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender.id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            isOwn ? 'text-primary-200' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwn && message.isRead && (
                              <CheckIcon className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Bir konuşma seçin
                  </h3>
                  <p className="text-gray-500">
                    Mesajlaşmaya başlamak için sol taraftan bir konuşma seçin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

