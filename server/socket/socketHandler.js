const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Kullanıcı bağlantıları
const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

const initializeSocket = (io) => {
  // Socket.IO middleware - JWT doğrulama
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Kullanıcıyı veritabanından kontrol et
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true
        }
      });

      if (!user || !user.isVerified) {
        return next(new Error('Authentication error: User not found or not verified'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} ${socket.user.lastName} connected: ${socket.id}`);

    // Kullanıcı bağlantısını kaydet
    userSockets.set(socket.userId, socket.id);
    socketUsers.set(socket.id, socket.userId);

    // Kullanıcının konuşmalarına abone ol
    socket.on('join_conversations', async () => {
      try {
        const conversations = await prisma.conversation.findMany({
          where: {
            OR: [
              { starterId: socket.userId },
              { recipientId: socket.userId }
            ]
          },
          select: { id: true }
        });

        conversations.forEach(conversation => {
          socket.join(`conversation_${conversation.id}`);
        });

        console.log(`User ${socket.userId} joined ${conversations.length} conversations`);
      } catch (error) {
        console.error('Error joining conversations:', error);
      }
    });

    // Yeni mesaj gönder
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;

        if (!conversationId || !content) {
          socket.emit('error', { message: 'Konuşma ID ve mesaj içeriği gereklidir' });
          return;
        }

        // Konuşmanın varlığını ve erişim yetkisini kontrol et
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            ad: true,
            starter: true,
            recipient: true
          }
        });

        if (!conversation) {
          socket.emit('error', { message: 'Konuşma bulunamadı' });
          return;
        }

        if (conversation.starterId !== socket.userId && conversation.recipientId !== socket.userId) {
          socket.emit('error', { message: 'Bu konuşmaya mesaj gönderme yetkiniz yok' });
          return;
        }

        // Mesajı veritabanına kaydet
        const message = await prisma.message.create({
          data: {
            content,
            conversationId: conversationId,
            senderId: socket.userId
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        // Konuşmanın son mesaj zamanını güncelle
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageTime: new Date() }
        });

        // Mesajı konuşmadaki tüm kullanıcılara gönder
        io.to(`conversation_${conversationId}`).emit('new_message', {
          message,
          conversationId
        });

        // Alıcıya bildirim gönder (eğer online değilse)
        const recipientId = conversation.starterId === socket.userId ? conversation.recipientId : conversation.starterId;
        const recipientSocketId = userSockets.get(recipientId);
        
        if (!recipientSocketId) {
          // Alıcı online değilse email bildirimi gönder
          const recipient = conversation.starterId === socket.userId ? conversation.recipient : conversation.starter;
          const { sendMessageNotification } = require('../utils/email');
          await sendMessageNotification(
            recipient.email,
            `${socket.user.firstName} ${socket.user.lastName}`,
            conversation.ad.title
          );
        }

        console.log(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Mesaj gönderilirken hata oluştu' });
      }
    });

    // Mesajı okundu olarak işaretle
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId } = data;

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: {
            conversation: true
          }
        });

        if (!message) {
          socket.emit('error', { message: 'Mesaj bulunamadı' });
          return;
        }

        // Kullanıcının bu mesaja erişim yetkisi var mı kontrol et
        if (message.conversation.starterId !== socket.userId && message.conversation.recipientId !== socket.userId) {
          socket.emit('error', { message: 'Bu mesaja erişim yetkiniz yok' });
          return;
        }

        // Kendi mesajını okundu olarak işaretleyemez
        if (message.senderId === socket.userId) {
          socket.emit('error', { message: 'Kendi mesajınızı okundu olarak işaretleyemezsiniz' });
          return;
        }

        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true }
        });

        // Diğer kullanıcıya mesajın okunduğunu bildir
        const otherUserId = message.conversation.starterId === socket.userId ? message.conversation.recipientId : message.conversation.starterId;
        const otherUserSocketId = userSockets.get(otherUserId);
        
        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit('message_read', {
            messageId,
            readBy: socket.userId
          });
        }

        console.log(`Message ${messageId} marked as read by user ${socket.userId}`);
      } catch (error) {
        console.error('Mark message as read error:', error);
        socket.emit('error', { message: 'Mesaj işaretlenirken hata oluştu' });
      }
    });

    // Kullanıcı yazıyor durumu
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        conversationId
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected: ${socket.id}`);
      
      // Kullanıcı bağlantısını temizle
      userSockets.delete(socket.userId);
      socketUsers.delete(socket.id);
    });
  });

  // Sunucu kapatılırken tüm bağlantıları temizle
  process.on('SIGINT', () => {
    console.log('Cleaning up socket connections...');
    userSockets.clear();
    socketUsers.clear();
  });
};

// Kullanıcının online olup olmadığını kontrol et
const isUserOnline = (userId) => {
  return userSockets.has(userId);
};

// Belirli bir kullanıcıya mesaj gönder
const sendToUser = (io, userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

module.exports = {
  initializeSocket,
  isUserOnline,
  sendToUser
};


