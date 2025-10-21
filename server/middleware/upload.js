const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörünü oluştur
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Dosya depolama yapılandırması
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Güvenli dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, safeName);
  }
});

// Dosya filtresi - Çok basit ve açık
const fileFilter = function (req, file, cb) {
  console.log('📁 Uploading file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // İzin verilen MIME türleri
  const allowedMimes = [
    // Resimler
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // PDF
    'application/pdf',
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // NOT: application/octet-stream kaldırıldı (güvenlik)
  ];

  // İzin verilen uzantılar
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    console.log('✅ File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ File rejected:', file.originalname, 'MIME:', file.mimetype, 'EXT:', ext);
    cb(new Error(`Desteklenmeyen dosya tipi: ${ext}. Sadece resim (JPG, PNG, GIF), PDF ve Word dosyaları kabul edilir.`), false);
  }
};

// Multer yapılandırması - 50MB limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1 // Tek dosya
  }
});

// Hata yönetimi middleware
const handleUploadError = (err, req, res, next) => {
  console.error('❌ Upload error:', err);

  if (err instanceof multer.MulterError) {
    // Multer hataları
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu çok büyük. Maksimum 50MB yükleyebilirsiniz.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Tek seferde sadece 1 dosya yükleyebilirsiniz.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Beklenmeyen dosya alanı.'
      });
    }
    // Diğer Multer hataları
    return res.status(400).json({
      success: false,
      message: 'Dosya yükleme hatası: ' + err.message
    });
  }

  // Özel dosya tipi hataları
  if (err && err.message && err.message.includes('Desteklenmeyen dosya tipi')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Genel hatalar
  if (err) {
    return res.status(500).json({
      success: false,
      message: 'Dosya yüklenirken bir hata oluştu.'
    });
  }

  next();
};

module.exports = {
  upload,
  handleUploadError
};
