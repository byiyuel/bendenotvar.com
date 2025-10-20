const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörünü oluştur
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Dosya depolama yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Dosya filtresi
const fileFilter = (req, file, cb) => {
  // İzin verilen dosya uzantıları
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  // İzin verilen MIME türleri
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/octet-stream' // Bazı sistemlerde docx bu şekilde gelir
  ];
  
  const mimetypeAllowed = allowedMimeTypes.includes(file.mimetype);

  if (mimetypeAllowed && extname) {
    return cb(null, true);
  } else {
    console.error('Rejected file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    cb(new Error(`Desteklenmeyen dosya tipi: ${file.mimetype}. Sadece resim (JPG, PNG, GIF), PDF ve Word dosyaları yüklenebilir!`));
  }
};

// Multer yapılandırması
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB
  },
  fileFilter: fileFilter
});

// Hata yönetimi middleware'i
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Dosya boyutu çok büyük. Maksimum 50MB yükleyebilirsiniz.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Çok fazla dosya yüklediniz.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Beklenmeyen dosya alanı.' 
      });
    }
    // Diğer Multer hataları
    return res.status(400).json({ 
      message: 'Dosya yükleme hatası: ' + error.message 
    });
  }
  
  // Dosya tipi hataları
  if (error.message && error.message.includes('Desteklenmeyen dosya tipi')) {
    return res.status(400).json({ 
      message: error.message 
    });
  }

  console.error('Upload error:', error);
  next(error);
};

module.exports = {
  upload,
  handleUploadError
};

