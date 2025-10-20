const nodemailer = require('nodemailer');

// Email transporter oluştur
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email doğrulama maili gönder
const sendVerificationEmail = async (email, token) => {
  // Development ortamında email göndermeyi simüle et
  if (process.env.NODE_ENV === 'development') {
    const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;
    console.log(`📧 Email Verification URL for ${email}:`);
    console.log(`   ${verificationUrl}`);
    console.log('   (Development mode - email not actually sent)');
    return true;
  }

  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'bendenotvar - Email Doğrulama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">bendenotvar'a Hoş Geldiniz!</h2>
        <p>Hesabınızı aktifleştirmek için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Email Adresimi Doğrula
        </a>
        <p>Bu bağlantı 24 saat geçerlidir.</p>
        <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          bendenotvar - Uludağ Üniversitesi Öğrenci Paylaşım Platformu
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Şifre sıfırlama maili gönder
const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'bendenotvar - Şifre Sıfırlama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Şifre Sıfırlama</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Şifremi Sıfırla
        </a>
        <p>Bu bağlantı 1 saat geçerlidir.</p>
        <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          bendenotvar - Uludağ Üniversitesi Öğrenci Paylaşım Platformu
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Yeni mesaj bildirimi gönder
const sendMessageNotification = async (email, senderName, adTitle) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'bendenotvar - Yeni Mesaj',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Yeni Mesaj Aldınız!</h2>
        <p><strong>${senderName}</strong> kullanıcısı "<strong>${adTitle}</strong>" ilanınız hakkında size mesaj gönderdi.</p>
        <p>Mesajınızı okumak için platforma giriş yapın.</p>
        <a href="${process.env.CLIENT_URL}/messages" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Mesajları Görüntüle
        </a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          bendenotvar - Uludağ Üniversitesi Öğrenci Paylaşım Platformu
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Message notification sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMessageNotification
};

