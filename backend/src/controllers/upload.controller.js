const fs = require('fs');
const path = require('path');

// @desc    Upload file to local storage
// @route   POST /api/upload/:type
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez télécharger un fichier'
      });
    }

    // Get the file path and URL
    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Return file info
    res.status(200).json({
      success: true,
      data: {
        key: req.file.filename,
        location: filePath,
        url: fileUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier',
      error: error.message
    });
  }
};

// @desc    Delete file from local storage
// @route   DELETE /api/upload/:key
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Clé de fichier non fournie'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', key);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier',
      error: error.message
    });
  }
};
