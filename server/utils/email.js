const Mailjet = require('node-mailjet');

// Mailjet client oluştur
const mailjet = Mailjet.apiConnect(
  process.env.EMAIL_USER, // API Key
  process.env.EMAIL_PASS  // Secret Key
);

// Email template HTML
const createEmailTemplate = (title, content, buttonText, buttonUrl, subtitle = '') => {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .title { color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; }
    .subtitle { color: #6b7280; font-size: 16px; margin: 0 0 30px 0; }
    .text { color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; }
    .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); }
    .button:hover { box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4); }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { color: #6b7280; font-size: 14px; margin: 0 0 15px 0; }
    .social-links { margin: 20px 0; }
    .social-link { display: inline-block; margin: 0 10px; color: #10b981; text-decoration: none; font-size: 14px; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header { padding: 30px 20px; }
      .title { font-size: 20px; }
      .button { padding: 14px 28px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>bendenotvar</h1>
    </div>
    
    <!-- Content -->
    <div class="content">
      <h2 class="title">${title}</h2>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
      
      <div class="text">
        ${content}
      </div>
      
      ${buttonText && buttonUrl ? `
      <div style="text-align: center; margin: 40px 0;">
        <a href="${buttonUrl}" class="button">${buttonText}</a>
      </div>
      ` : ''}
      
      <div class="divider"></div>
      
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        Bu e-postayı almak istemiyorsanız, hesap ayarlarınızdan bildirim tercihlerinizi değiştirebilirsiniz.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        <strong>bendenotvar</strong><br>
        Uludağ Üniversitesi Öğrenci Paylaşım Platformu
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
        © ${new Date().getFullYear()} bendenotvar. Tüm hakları saklıdır.
      </p>
      
      <div style="margin-top: 20px;">
        <a href="https://bendenotvar.com.tr" style="color: #10b981; text-decoration: none; font-size: 13px;">Ana Sayfa</a>
        <span style="color: #d1d5db; margin: 0 8px;">•</span>
        <a href="https://bendenotvar.com.tr/privacy" style="color: #10b981; text-decoration: none; font-size: 13px;">Gizlilik</a>
        <span style="color: #d1d5db; margin: 0 8px;">•</span>
        <a href="https://bendenotvar.com.tr/terms" style="color: #10b981; text-decoration: none; font-size: 13px;">Şartlar</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
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

  const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;
  
  const htmlContent = createEmailTemplate(
    'Hoş Geldiniz! 🎉',
    `
      <p>bendenotvar topluluğuna katıldığınız için teşekkür ederiz!</p>
      <p>Hesabınızı aktifleştirmek ve kampüs arkadaşlarınızla ders notlarını, kitapları ve daha fazlasını paylaşmaya başlamak için aşağıdaki butona tıklayın.</p>
      <p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong style="color: #92400e;">⏰ Önemli:</strong> Bu doğrulama linki 24 saat geçerlidir.
      </p>
    `,
    'Email Adresimi Doğrula',
    verificationUrl,
    'Hesabınızı aktifleştirin'
  );
  
  try {
    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'noreply@bendenotvar.com.tr',
              Name: 'bendenotvar'
            },
            To: [
              {
                Email: email
              }
            ],
            Subject: '🎓 bendenotvar - Hesabınızı Doğrulayın',
            HTMLPart: htmlContent
          }
        ]
      });

    const result = await request;
    console.log(`✅ Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.statusCode, error.message);
    return false;
  }
};

// Şifre sıfırlama maili gönder
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const htmlContent = createEmailTemplate(
    'Şifre Sıfırlama Talebi',
    `
      <p>Hesabınız için bir şifre sıfırlama talebi aldık.</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
      <p style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong style="color: #991b1b;">🔒 Güvenlik:</strong> Bu link 1 saat geçerlidir ve sadece bir kez kullanılabilir.
      </p>
    `,
    'Şifremi Sıfırla',
    resetUrl,
    'Güvenlik nedeniyle hızlı işlem yapın'
  );
  
  try {
    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'noreply@bendenotvar.com.tr',
              Name: 'bendenotvar'
            },
            To: [
              {
                Email: email
              }
            ],
            Subject: '🔐 bendenotvar - Şifre Sıfırlama',
            HTMLPart: htmlContent
          }
        ]
      });

    const result = await request;
    console.log(`✅ Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.statusCode, error.message);
    return false;
  }
};

// Yeni mesaj bildirimi gönder
const sendMessageNotification = async (email, senderName, adTitle) => {
  const htmlContent = createEmailTemplate(
    'Yeni Mesaj Aldınız! 💬',
    `
      <p><strong>${senderName}</strong> kullanıcısı "<strong>${adTitle}</strong>" ilanınız hakkında size mesaj gönderdi.</p>
      <p>Mesajı okumak ve yanıtlamak için platforma giriş yapın. Hızlı yanıt vermek, kampüs arkadaşlarınızla iletişiminizi güçlendirir!</p>
      <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af;">
          <strong>💡 İpucu:</strong> Mesajlarınızı düzenli kontrol ederek daha iyi bir paylaşım deneyimi yaşayın.
        </p>
      </div>
    `,
    'Mesajları Görüntüle',
    `${process.env.CLIENT_URL}/messages`,
    'Hızlı yanıt verin'
  );
  
  try {
    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'noreply@bendenotvar.com.tr',
              Name: 'bendenotvar'
            },
            To: [
              {
                Email: email
              }
            ],
            Subject: `💬 ${senderName} size mesaj gönderdi - bendenotvar`,
            HTMLPart: htmlContent
          }
        ]
      });

    const result = await request;
    console.log(`✅ Message notification sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.statusCode, error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMessageNotification
};
