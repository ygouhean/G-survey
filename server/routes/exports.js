const express = require('express');
const router = express.Router();
const { Response, Survey, User } = require('../models');
const { protect, canAccessSurvey } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const XLSX = require('xlsx');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const cloudinary = require('../services/cloudinary');
const { promisify } = require('util');

// @route   GET /api/exports/survey/:surveyId/excel
// @desc    Export survey responses to Excel
// @access  Private
router.get('/survey/:surveyId/excel', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Construire le filtre de dates
    const whereClause = { surveyId: req.params.surveyId };
    const { startDate, endDate } = req.query;
    
    if (startDate || endDate) {
      whereClause.submittedAt = {};
      if (startDate) {
        whereClause.submittedAt[sequelize.Sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Fin de journée
        whereClause.submittedAt[sequelize.Sequelize.Op.lte] = end;
      }
    }

    const responses = await Response.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'respondent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

    // Prepare data for Excel
    const data = [];
    
    // Headers
    const headers = ['ID', 'Date de soumission', 'Répondant', 'Email'];
    survey.questions.forEach(q => {
      headers.push(q.label);
    });
    headers.push('Score NPS', 'Score CSAT', 'Score CES', 'Latitude', 'Longitude');
    
    data.push(headers);

    // Rows
    responses.forEach(response => {
      // Extract coordinates from PostGIS geometry if present
      let lat = '';
      let lon = '';
      if (response.location) {
        // Query coordinates using PostGIS functions
        sequelize.query(`
          SELECT ST_Y(location) as lat, ST_X(location) as lon 
          FROM responses 
          WHERE id = :responseId
        `, {
          replacements: { responseId: response.id },
          type: sequelize.QueryTypes.SELECT
        }).then(([result]) => {
          if (result) {
            lat = result.lat;
            lon = result.lon;
          }
        }).catch(() => {});
      }

      const row = [
        response.id,
        new Date(response.submittedAt).toLocaleString('fr-FR'),
        response.respondent ? `${response.respondent.firstName} ${response.respondent.lastName}` : 'Anonyme',
        response.respondent ? response.respondent.email : ''
      ];

      // Add answers
      survey.questions.forEach(q => {
        const answer = response.answers.find(a => a.questionId === q.id);
        if (answer) {
          // Si c'est une question avec fichiers (photo, video, file)
          if (['photo', 'video', 'file'].includes(q.type)) {
            if (Array.isArray(answer.value) && answer.value.length > 0) {
              // Créer des liens cliquables vers les fichiers
              const fileLinks = answer.value.map(file => {
                if (file && typeof file === 'object' && file.url) {
                  // Construire l'URL complète
                  const fullUrl = `${req.protocol}://${req.get('host')}${file.url}`;
                  return `${file.originalName || 'Fichier'} : ${fullUrl}`;
                }
                return String(file);
              });
              row.push(fileLinks.join('\n'));
            } else {
              row.push('');
            }
          }
          // Autres types de questions
          else if (Array.isArray(answer.value)) {
            row.push(answer.value.join(', '));
          } else if (typeof answer.value === 'object') {
            row.push(JSON.stringify(answer.value));
          } else {
            row.push(answer.value);
          }
        } else {
          row.push('');
        }
      });

      // Add scores and location
      row.push(
        response.npsScore || '',
        response.csatScore || '',
        response.cesScore || '',
        lat,
        lon
      );

      data.push(row);
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-size columns
    const colWidths = headers.map((h, i) => {
      const maxLength = Math.max(
        h.length,
        ...data.slice(1).map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Réponses');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${survey.title}_${Date.now()}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/exports/survey/:surveyId/csv
// @desc    Export survey responses to CSV
// @access  Private
router.get('/survey/:surveyId/csv', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Construire le filtre de dates
    const whereClause = { surveyId: req.params.surveyId };
    const { startDate, endDate } = req.query;
    
    if (startDate || endDate) {
      whereClause.submittedAt = {};
      if (startDate) {
        whereClause.submittedAt[sequelize.Sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.submittedAt[sequelize.Sequelize.Op.lte] = end;
      }
    }

    const responses = await Response.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'respondent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

    // Prepare CSV data
    const headers = ['ID', 'Date de soumission', 'Répondant', 'Email'];
    survey.questions.forEach(q => {
      headers.push(q.label);
    });
    headers.push('Score NPS', 'Score CSAT', 'Score CES', 'Latitude', 'Longitude');

    let csv = headers.map(h => `"${h}"`).join(',') + '\n';

    for (const response of responses) {
      // Extract coordinates from PostGIS geometry
      let lat = '';
      let lon = '';
      if (response.location) {
        const [result] = await sequelize.query(`
          SELECT ST_Y(location) as lat, ST_X(location) as lon 
          FROM responses 
          WHERE id = :responseId
        `, {
          replacements: { responseId: response.id },
          type: sequelize.QueryTypes.SELECT
        });
        if (result) {
          lat = result.lat;
          lon = result.lon;
        }
      }

      const row = [
        response.id,
        new Date(response.submittedAt).toLocaleString('fr-FR'),
        response.respondent ? `${response.respondent.firstName} ${response.respondent.lastName}` : 'Anonyme',
        response.respondent ? response.respondent.email : ''
      ];

      survey.questions.forEach(q => {
        const answer = response.answers.find(a => a.questionId === q.id);
        if (answer) {
          // Si c'est une question avec fichiers (photo, video, file)
          if (['photo', 'video', 'file'].includes(q.type)) {
            if (Array.isArray(answer.value) && answer.value.length > 0) {
              // Créer des liens cliquables vers les fichiers
              const fileLinks = answer.value.map(file => {
                if (file && typeof file === 'object' && file.url) {
                  const fullUrl = `${req.protocol}://${req.get('host')}${file.url}`;
                  return `${file.originalName || 'Fichier'} : ${fullUrl}`;
                }
                return String(file);
              });
              row.push(fileLinks.join(' | '));
            } else {
              row.push('');
            }
          }
          // Autres types de questions
          else if (Array.isArray(answer.value)) {
            row.push(answer.value.join('; '));
          } else if (typeof answer.value === 'object') {
            row.push(JSON.stringify(answer.value));
          } else {
            row.push(String(answer.value).replace(/"/g, '""'));
          }
        } else {
          row.push('');
        }
      });

      row.push(
        response.npsScore || '',
        response.csatScore || '',
        response.cesScore || '',
        lat,
        lon
      );

      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${survey.title}_${Date.now()}.csv"`);
    res.send('\ufeff' + csv); // UTF-8 BOM for Excel compatibility
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/exports/survey/:surveyId/json
// @desc    Export survey responses to JSON
// @access  Private
router.get('/survey/:surveyId/json', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Construire le filtre de dates
    const whereClause = { surveyId: req.params.surveyId };
    const { startDate, endDate } = req.query;
    
    if (startDate || endDate) {
      whereClause.submittedAt = {};
      if (startDate) {
        whereClause.submittedAt[sequelize.Sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.submittedAt[sequelize.Sequelize.Op.lte] = end;
      }
    }

    const responses = await Response.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'respondent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

    // Extract coordinates for each response
    const responsesWithLocation = await Promise.all(responses.map(async (r) => {
      let location = null;
      if (r.location) {
        const [result] = await sequelize.query(`
          SELECT ST_Y(location) as lat, ST_X(location) as lon 
          FROM responses 
          WHERE id = :responseId
        `, {
          replacements: { responseId: r.id },
          type: sequelize.QueryTypes.SELECT
        });
        if (result) {
          location = {
            type: 'Point',
            coordinates: [result.lon, result.lat]
          };
        }
      }

      return {
        id: r.id,
        submittedAt: r.submittedAt,
        respondent: r.respondent ? {
          name: `${r.respondent.firstName} ${r.respondent.lastName}`,
          email: r.respondent.email
        } : null,
        answers: r.answers,
        scores: {
          nps: r.npsScore,
          csat: r.csatScore,
          ces: r.cesScore
        },
        location
      };
    }));

    const exportData = {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        exportedAt: new Date()
      },
      responses: responsesWithLocation
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${survey.title}_${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/exports/survey/:surveyId/complete
// @desc    Export survey responses with all uploaded files in a ZIP archive
// @access  Private
router.get('/survey/:surveyId/complete', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Construire le filtre de dates
    const whereClause = { surveyId: req.params.surveyId };
    const { startDate, endDate } = req.query;
    
    if (startDate || endDate) {
      whereClause.submittedAt = {};
      if (startDate) {
        whereClause.submittedAt[sequelize.Sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.submittedAt[sequelize.Sequelize.Op.lte] = end;
      }
    }

    const responses = await Response.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'respondent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

    // Créer un archive ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 } // Niveau de compression maximum
    });

    // Configurer les headers de la réponse
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${survey.title.replace(/[^a-z0-9]/gi, '_')}_complete_${Date.now()}.zip"`);

    // Pipe l'archive vers la réponse HTTP
    archive.pipe(res);

    // Générer le fichier Excel
    const excelData = [];
    
    // Headers
    const headers = ['ID', 'Date de soumission', 'Répondant', 'Email'];
    survey.questions.forEach(q => {
      headers.push(q.label);
    });
    headers.push('Score NPS', 'Score CSAT', 'Score CES', 'Latitude', 'Longitude');
    
    excelData.push(headers);

    // Rows et collecte des fichiers
    const tempFilesDir = path.join(__dirname, '../../temp_export_files');
    
    // Créer le dossier temporaire s'il n'existe pas
    if (!fs.existsSync(tempFilesDir)) {
      fs.mkdirSync(tempFilesDir, { recursive: true });
    }
    
    let responseIndex = 1;
    const tempFiles = []; // Pour nettoyer après l'export

    // Fonction pour télécharger un fichier depuis Cloudinary ou URL
    const downloadFile = async (url, filepath) => {
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);
        
        protocol.get(url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            // Suivre les redirections
            return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
          }
          
          if (response.statusCode !== 200) {
            file.close();
            fs.unlinkSync(filepath);
            return reject(new Error(`Erreur HTTP: ${response.statusCode}`));
          }
          
          response.pipe(file);
          
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          file.close();
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          reject(err);
        });
      });
    };

    for (const response of responses) {
      // Extract coordinates
      let lat = '';
      let lon = '';
      if (response.location) {
        const [result] = await sequelize.query(`
          SELECT ST_Y(location) as lat, ST_X(location) as lon 
          FROM responses 
          WHERE id = :responseId
        `, {
          replacements: { responseId: response.id },
          type: sequelize.QueryTypes.SELECT
        });
        if (result) {
          lat = result.lat;
          lon = result.lon;
        }
      }

      const row = [
        response.id,
        new Date(response.submittedAt).toLocaleString('fr-FR'),
        response.respondent ? `${response.respondent.firstName} ${response.respondent.lastName}` : 'Anonyme',
        response.respondent ? response.respondent.email : ''
      ];

      // Add answers and collect files
      let questionIndex = 1;
      for (const q of survey.questions) {
        const answer = response.answers.find(a => a.questionId === q.id);
        if (answer) {
          // Si c'est une question avec fichiers
          if (['photo', 'video', 'file'].includes(q.type)) {
            if (Array.isArray(answer.value) && answer.value.length > 0) {
              const fileLinks = [];
              let fileIndex = 1;
              
              for (const file of answer.value) {
                try {
                  let fileUrl = null;
                  let fileName = null;
                  
                  // Gérer différents formats de stockage
                  if (file && typeof file === 'object') {
                    // Format Cloudinary (avec url)
                    if (file.url) {
                      fileUrl = file.url;
                      fileName = file.originalName || file.originalname || `file_${fileIndex}.${file.format || 'bin'}`;
                    }
                    // Format avec public_id (Cloudinary)
                    else if (file.public_id) {
                      // Générer l'URL depuis Cloudinary
                      fileUrl = cloudinary.url(file.public_id, {
                        resource_type: file.resource_type || 'auto',
                        secure: true
                      });
                      fileName = file.originalName || file.originalname || `${file.public_id}.${file.format || 'bin'}`;
                    }
                  } else if (typeof file === 'string') {
                    // Format string (URL directe)
                    fileUrl = file;
                    const urlParts = file.split('/');
                    fileName = urlParts[urlParts.length - 1] || `file_${fileIndex}.bin`;
                  }
                  
                  if (fileUrl) {
                    // Télécharger le fichier temporairement
                    const safeFileName = fileName.replace(/[^a-z0-9._-]/gi, '_');
                    const tempFilePath = path.join(tempFilesDir, `temp_${response.id}_${questionIndex}_${fileIndex}_${Date.now()}_${safeFileName}`);
                    tempFiles.push(tempFilePath);
                    
                    try {
                      await downloadFile(fileUrl, tempFilePath);
                      
                      // Ajouter le fichier au ZIP avec un chemin organisé
                      const safeQuestionLabel = q.label.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
                      const zipPath = `reponse_${responseIndex}/question_${questionIndex}_${safeQuestionLabel}/${safeFileName}`;
                      archive.file(tempFilePath, { name: zipPath });
                      
                      // Ajouter le nom du fichier dans le Excel
                      fileLinks.push(safeFileName);
                      fileIndex++;
                    } catch (downloadError) {
                      console.error(`Erreur téléchargement fichier ${fileUrl}:`, downloadError);
                      fileLinks.push(`${safeFileName} (erreur téléchargement)`);
                    }
                  }
                } catch (error) {
                  console.error('Erreur traitement fichier:', error);
                }
              }
              
              row.push(fileLinks.length > 0 ? fileLinks.join('\n') : 'Aucun fichier');
            } else {
              row.push('');
            }
          }
          // Autres types de questions
          else if (Array.isArray(answer.value)) {
            row.push(answer.value.join(', '));
          } else if (typeof answer.value === 'object') {
            row.push(JSON.stringify(answer.value));
          } else {
            row.push(answer.value);
          }
        } else {
          row.push('');
        }
        questionIndex++;
      }

      // Add scores and location
      row.push(
        response.npsScore || '',
        response.csatScore || '',
        response.cesScore || '',
        lat,
        lon
      );

      excelData.push(row);
      responseIndex++;
    }

    // Créer le workbook Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Auto-size columns
    const colWidths = headers.map((h, i) => {
      const maxLength = Math.max(
        h.length,
        ...excelData.slice(1).map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Réponses');

    // Générer le buffer Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Ajouter le fichier Excel au ZIP
    archive.append(excelBuffer, { name: `${survey.title.replace(/[^a-z0-9]/gi, '_')}_reponses.xlsx` });

    // Ajouter un fichier README
    const readmeContent = `
📊 Export Complet du Sondage : ${survey.title}
===========================================

📅 Date d'export : ${new Date().toLocaleString('fr-FR')}
📝 Nombre de réponses : ${responses.length}

📁 Structure de l'archive :
---------------------------

1. ${survey.title.replace(/[^a-z0-9]/gi, '_')}_reponses.xlsx
   → Fichier Excel contenant toutes les réponses
   → Les colonnes indiquent où trouver les fichiers uploadés

2. reponse_X/
   → Dossiers contenant les fichiers uploadés par chaque répondant
   → question_Y_[nom de la question]/
     → Photos, vidéos, ou pièces jointes de cette question

📖 Instructions :
-----------------

1. Ouvrez le fichier Excel pour voir toutes les réponses
2. Pour les questions avec fichiers, consultez les dossiers correspondants
3. Les fichiers sont organisés par numéro de réponse et numéro de question

💡 Astuce : Utilisez Ctrl+F dans Excel pour rechercher une réponse spécifique

---
Généré par G-Survey - ${new Date().getFullYear()}
`;

    archive.append(readmeContent, { name: 'README.txt' });

    // Gestionnaire pour nettoyer les fichiers temporaires après l'export
    archive.on('end', () => {
      // Nettoyer les fichiers temporaires
      tempFiles.forEach((tempFile) => {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          console.error('Erreur nettoyage fichier temporaire:', cleanupError);
        }
      });
      
      // Nettoyer le dossier temporaire s'il est vide
      try {
        const files = fs.readdirSync(tempFilesDir);
        if (files.length === 0) {
          fs.rmdirSync(tempFilesDir);
        }
      } catch (cleanupError) {
        console.error('Erreur nettoyage dossier temporaire:', cleanupError);
      }
    });

    // Gestionnaire d'erreur pour nettoyer en cas d'échec
    archive.on('error', (error) => {
      console.error('Erreur archive:', error);
      tempFiles.forEach((tempFile) => {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          console.error('Erreur nettoyage fichier temporaire:', cleanupError);
        }
      });
    });

    // Finaliser l'archive
    await archive.finalize();

  } catch (error) {
    console.error('Erreur export complet:', error);
    
    // Nettoyer les fichiers temporaires en cas d'erreur
    tempFiles.forEach((tempFile) => {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (cleanupError) {
        console.error('Erreur nettoyage fichier temporaire:', cleanupError);
      }
    });
    
    next(error);
  }
});

module.exports = router;
