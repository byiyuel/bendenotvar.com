const { body, validationResult } = require('express-validator');

// Ad validation
const validateAd = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Başlık 3-100 karakter arasında olmalıdır'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Açıklama 10-1000 karakter arasında olmalıdır'),
  body('category')
    .isIn(['Not', 'Kitap', 'Ekipman', 'PDF', 'Proje', 'Acil'])
    .withMessage('Geçerli bir kategori seçiniz'),
  body('shareType')
    .isIn(['BORROW', 'PERMANENT', 'DIGITAL'])
    .withMessage('Geçerli bir paylaşım türü seçiniz'),
  body('locationDetails')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Konum detayları en fazla 200 karakter olabilir'),
  body('whatsappLink')
    .optional()
    .isURL()
    .withMessage('Geçerli bir WhatsApp linki giriniz')
];

// Message validation
const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Mesaj 1-500 karakter arasında olmalıdır'),
  body('conversationId')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Geçerli bir konuşma ID giriniz'),
  body('adId')
    .optional()
    .isUUID()
    .withMessage('Geçerli bir ilan ID giriniz')
];

// User profile validation
const validateUserProfile = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ad 2-50 karakter arasında olmalıdır'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyad 2-50 karakter arasında olmalıdır'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bölüm 2-100 karakter arasında olmalıdır'),
  body('faculty')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Fakülte 2-100 karakter arasında olmalıdır')
];

// Password validation
const validatePassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir')
];

// Email validation
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      message: 'Giriş bilgilerinde hata var',
      errors: errors.array()
    });
  }
  next();
};

// Helper function to check if user owns the resource
const checkOwnership = (resourceUserId, currentUserId) => {
  return resourceUserId === currentUserId;
};

// Helper function to validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Helper function to sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

// Helper function to validate pagination parameters
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 12;
  
  return {
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum))
  };
};

// Helper function to validate sort parameters
const validateSort = (sortBy, sortOrder, allowedFields) => {
  const validSortBy = allowedFields.includes(sortBy) ? sortBy : allowedFields[0];
  const validSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
  
  return {
    sortBy: validSortBy,
    sortOrder: validSortOrder
  };
};

module.exports = {
  validateAd,
  validateMessage,
  validateUserProfile,
  validatePassword,
  validateEmail,
  handleValidationErrors,
  checkOwnership,
  isValidUUID,
  sanitizeInput,
  validatePagination,
  validateSort
};

