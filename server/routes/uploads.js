const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../services/cloudinary');
const { protect } = require('../middleware/auth');

// Stockage en mémoire: on envoie ensuite vers Cloudinary
const storage = multer.memoryStorage();

// Configuration multer avec limites
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max par fichier
  },
  fileFilter: function (req, file, cb) {
    // Types de fichiers autorisés
    const allowedExtensions = /jpeg|jpg|png|gif|mp4|avi|mov|webm|ogg|quicktime|3gp|mkv|m4v|pdf|doc|docx|xls|xlsx|csv|zip/;
    const allowedMimeTypes = [
      // Images
      /^image\/(jpeg|jpg|png|gif|webp)$/,
      // Vidéos
      /^video\/(mp4|avi|quicktime|webm|ogg|x-msvideo|3gpp|x-matroska|m4v)$/,
      // Documents
      /^application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|csv|zip)$/,
      // Audio (si nécessaire)
      /^audio\/(mp3|wav|ogg|m4a)$/
    ];
    
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.some(regex => regex.test(file.mimetype));

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      console.error('Type de fichier rejeté:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        extname: path.extname(file.originalname)
      });
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype || 'inconnu'}`));
    }
  }
});

// @route   POST /api/uploads/files
// @desc    Upload multiple files (photos, videos, attachments)
// @access  Private
router.post('/files', protect, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier reçu'
      });
    }

    // Upload vers Cloudinary (promesses)
    const uploads = await Promise.all(
      req.files.map(file => new Promise((resolve, reject) => {
        const folder = 'g-survey/uploads';
        const resource_type = file.mimetype.startsWith('video') ? 'video' : (file.mimetype === 'application/pdf' ? 'raw' : 'auto');

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type,
            filename_override: path.parse(file.originalname).name,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              originalName: file.originalname,
              url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
              bytes: result.bytes,
              format: result.format,
              uploadedAt: new Date()
            });
          }
        );

        uploadStream.end(file.buffer);
      }))
    );

    res.json({
      success: true,
      files: uploads,
      count: uploads.length
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des fichiers',
      error: error.message
    });
  }
});

// @route   DELETE /api/uploads/file/:filename
// @desc    Delete a specific file
// @access  Private
router.delete('/file/:publicId', protect, async (req, res, next) => {
  try {
    const publicId = req.params.publicId;
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'auto' });
    if (result.result === 'not found') {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
    }
    res.json({ success: true, message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier'
    });
  }
});

// Middleware de gestion d'erreurs pour multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 100 MB)'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers (max 10)'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Erreur lors de l\'upload'
  });
});

module.exports = router;



