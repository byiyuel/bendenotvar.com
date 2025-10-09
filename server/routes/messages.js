const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateMessage, handleValidationErrors } = require('../utils/validation');
const { sendMessageNotification } = require('../utils/email');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Konuşma oluştur veya mevcut konuşmayı getir
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { adId, recipientId } = req.body;

    if (!adId || !recipientId) {
      return res.status(400).json({
        message: 'Ad ID ve recipient ID gerekli'
      });
    }

    // İlan var mı kontrol et
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!ad) {
      return res.status(404).json({
        message: 'İlan bulunamadı'
      });
    }

    // Kendi ilanına mesaj atamaz
    const userId = req.user.userId || req.user.id;
    if (ad.userId === userId) {
      return res.status(400).json({
        message: 'Kendi ilanınıza mesaj atamazsınız'
      });
    }

    // Mevcut konuşma var mı kontrol et
    let conversation = await prisma.conversation.findFirst({
      where: {
        adId: adId,
        OR: [
          {
            starterId: userId,
            recipientId: recipientId
          },
          {
            starterId: recipientId,
            recipientId: userId
          }
        ]
      },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        starter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        }
      }
    });

    // Konuşma yoksa oluştur
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          adId: adId,
          starterId: req.user.id,
          recipientId: recipientId,
          lastMessageTime: new Date()
        },
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              category: true
            }
          },
          starter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
              faculty: true
            }
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
              faculty: true
            }
          }
        }
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      message: 'Konuşma oluşturulurken hata oluştu'
    });
  }
});

// Konuşmaları getir
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { starterId: req.user.userId || req.user.id },
          { recipientId: req.user.userId || req.user.id }
        ]
      },
      orderBy: { lastMessageTime: 'desc' },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        starter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      message: 'Konuşmalar alınırken hata oluştu'
    });
  }
});

// Konuşma detayını getir
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            category: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        starter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Konuşma bulunamadı'
      });
    }

    // Kullanıcının bu konuşmaya erişim yetkisi var mı kontrol et
    if (conversation.starterId !== req.user.id && conversation.recipientId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu konuşmaya erişim yetkiniz yok'
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      message: 'Konuşma alınırken hata oluştu'
    });
  }
});

// Konuşmadaki mesajları getir
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Konuşmanın varlığını ve erişim yetkisini kontrol et
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { starterId: true, recipientId: true }
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Konuşma bulunamadı'
      });
    }

    if (conversation.starterId !== req.user.id && conversation.recipientId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu konuşmaya erişim yetkiniz yok'
      });
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.message.count({ where: { conversationId: id } })
    ]);

    // Mesajları okundu olarak işaretle (kendi mesajları hariç)
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: req.user.id },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      message: 'Mesajlar alınırken hata oluştu'
    });
  }
});

// Yeni mesaj gönder
router.post('/send', authenticateToken, validateMessage, handleValidationErrors, async (req, res) => {
  try {
    const { content, conversationId, adId } = req.body;
    console.log('Send message request:', { content, conversationId, adId, user: req.user });
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({
        message: 'Kimlik doğrulama gerekli'
      });
    }

    if (!conversationId && !adId) {
      console.log('Neither conversationId nor adId provided');
      return res.status(400).json({
        message: 'Konuşma ID veya İlan ID gereklidir'
      });
    }

    const userId = req.user.userId || req.user.id;

    let conversation;

    if (conversationId) {
      // Mevcut konuşmaya mesaj gönder
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          ad: true,
          starter: true,
          recipient: true
        }
      });

      if (!conversation) {
        return res.status(404).json({
          message: 'Konuşma bulunamadı'
        });
      }

      // Kullanıcının bu konuşmaya erişim yetkisi var mı kontrol et
      const userId = req.user.userId || req.user.id;
      if (conversation.starterId !== userId && conversation.recipientId !== userId) {
        return res.status(403).json({
          message: 'Bu konuşmaya mesaj gönderme yetkiniz yok'
        });
      }
    } else if (adId) {
      // Yeni konuşma başlat
      const ad = await prisma.ad.findUnique({
        where: { id: adId },
        include: { user: true }
      });

      if (!ad) {
        return res.status(404).json({
          message: 'İlan bulunamadı'
        });
      }

      if (ad.userId === userId) {
        return res.status(400).json({
          message: 'Kendi ilanınıza mesaj gönderemezsiniz'
        });
      }

      // Daha önce bu ilan için konuşma var mı kontrol et
      conversation = await prisma.conversation.findFirst({
        where: {
          adId: adId,
          starterId: userId,
          recipientId: ad.userId
        },
        include: {
          ad: true,
          starter: true,
          recipient: true
        }
      });

      if (!conversation) {
        // Yeni konuşma oluştur
        conversation = await prisma.conversation.create({
          data: {
            adId: adId,
            starterId: userId,
            recipientId: ad.userId
          },
          include: {
            ad: true,
            starter: true,
            recipient: true
          }
        });
      }
    } else {
      return res.status(400).json({
        message: 'Konuşma ID veya İlan ID gereklidir'
      });
    }

    // Mesajı oluştur
    const message = await prisma.message.create({
      data: {
        content,
        conversationId: conversation.id,
        senderId: userId
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
      where: { id: conversation.id },
      data: { lastMessageTime: new Date() }
    });

    // Alıcıya email bildirimi gönder (kendi mesajı değilse)
    if (conversation.starterId !== userId && conversation.recipientId !== userId) {
      const recipient = conversation.starterId === userId ? conversation.recipient : conversation.starter;
      await sendMessageNotification(
        recipient.email,
        `${req.user.firstName} ${req.user.lastName}`,
        conversation.ad.title
      );
    }

    res.status(201).json({
      message: 'Mesaj başarıyla gönderildi',
      messageData: message,
      conversation
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Mesaj gönderilirken hata oluştu'
    });
  }
});

// Mesajı okundu olarak işaretle
router.patch('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: true
      }
    });

    if (!message) {
      return res.status(404).json({
        message: 'Mesaj bulunamadı'
      });
    }

    // Kullanıcının bu mesaja erişim yetkisi var mı kontrol et
    if (message.conversation.starterId !== req.user.id && message.conversation.recipientId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu mesaja erişim yetkiniz yok'
      });
    }

    // Kendi mesajını okundu olarak işaretleyemez
    if (message.senderId === req.user.id) {
      return res.status(400).json({
        message: 'Kendi mesajınızı okundu olarak işaretleyemezsiniz'
      });
    }

    await prisma.message.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      message: 'Mesaj okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      message: 'Mesaj işaretlenirken hata oluştu'
    });
  }
});

// Okunmamış mesaj sayısını getir
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { starterId: req.user.id },
            { recipientId: req.user.id }
          ]
        },
        isRead: false,
        senderId: { not: req.user.id }
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      message: 'Okunmamış mesaj sayısı alınırken hata oluştu'
    });
  }
});

module.exports = router;


