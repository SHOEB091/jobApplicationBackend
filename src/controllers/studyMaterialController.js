const StudyMaterial = require('../models/StudyMaterial');

// Create new study material
exports.createStudyMaterial = async (req, res) => {
  try {
    const { title, description, fileUrl, type } = req.body;

    const studyMaterial = new StudyMaterial({
      title,
      description,
      fileUrl,
      type,
      uploadedBy: req.user._id
    });

    await studyMaterial.save();

    res.status(201).json({
      success: true,
      data: studyMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all study materials
exports.getAllStudyMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete study material
exports.deleteStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    await material.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
