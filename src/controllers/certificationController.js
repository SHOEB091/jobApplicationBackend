const Certification = require('../models/Certification');

// Create new certification
exports.createCertification = async (req, res) => {
  try {
    const { title, fileUrl: linkUrl } = req.body;
    let fileUrl = '';

    if (req.file) {
      fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    } else if (linkUrl) {
      fileUrl = linkUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a certification file or provide a link'
      });
    }

    const certification = await Certification.create({
      title,
      fileUrl,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: certification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all certifications
exports.getAllCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certifications.length,
      data: certifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete certification
exports.deleteCertification = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    await certification.deleteOne();

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
