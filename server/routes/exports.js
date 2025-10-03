const express = require('express');
const router = express.Router();
const Response = require('../models/Response');
const Survey = require('../models/Survey');
const { protect, canAccessSurvey } = require('../middleware/auth');
const XLSX = require('xlsx');

// @route   GET /api/exports/survey/:surveyId/excel
// @desc    Export survey responses to Excel
// @access  Private
router.get('/survey/:surveyId/excel', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    const responses = await Response.find({ survey: req.params.surveyId })
      .populate('respondent', 'firstName lastName email')
      .sort('-submittedAt');

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
      const row = [
        response._id.toString(),
        new Date(response.submittedAt).toLocaleString('fr-FR'),
        response.respondent ? `${response.respondent.firstName} ${response.respondent.lastName}` : 'Anonyme',
        response.respondent ? response.respondent.email : ''
      ];

      // Add answers
      survey.questions.forEach(q => {
        const answer = response.answers.find(a => a.questionId === q.id);
        if (answer) {
          if (Array.isArray(answer.value)) {
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
        response.location?.coordinates?.[1] || '',
        response.location?.coordinates?.[0] || ''
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
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    const responses = await Response.find({ survey: req.params.surveyId })
      .populate('respondent', 'firstName lastName email')
      .sort('-submittedAt');

    // Prepare CSV data
    const headers = ['ID', 'Date de soumission', 'Répondant', 'Email'];
    survey.questions.forEach(q => {
      headers.push(q.label);
    });
    headers.push('Score NPS', 'Score CSAT', 'Score CES', 'Latitude', 'Longitude');

    let csv = headers.map(h => `"${h}"`).join(',') + '\n';

    responses.forEach(response => {
      const row = [
        response._id.toString(),
        new Date(response.submittedAt).toLocaleString('fr-FR'),
        response.respondent ? `${response.respondent.firstName} ${response.respondent.lastName}` : 'Anonyme',
        response.respondent ? response.respondent.email : ''
      ];

      survey.questions.forEach(q => {
        const answer = response.answers.find(a => a.questionId === q.id);
        if (answer) {
          if (Array.isArray(answer.value)) {
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
        response.location?.coordinates?.[1] || '',
        response.location?.coordinates?.[0] || ''
      );

      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

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
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    const responses = await Response.find({ survey: req.params.surveyId })
      .populate('respondent', 'firstName lastName email')
      .sort('-submittedAt');

    const exportData = {
      survey: {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        exportedAt: new Date()
      },
      responses: responses.map(r => ({
        id: r._id,
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
        location: r.location
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${survey.title}_${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
