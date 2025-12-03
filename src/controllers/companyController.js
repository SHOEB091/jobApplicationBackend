const Company = require('../models/Company');
const { companySchema } = require('../utils/validationSchemas');

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private/Superadmin
const createCompany = async (req, res) => {
  try {
    const { error } = companySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, description, location, website, industry, size, logo } = req.body;

    // Check if company already exists
    const companyExists = await Company.findOne({ name });
    if (companyExists) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }

    const company = await Company.create({
      name,
      description,
      location,
      website,
      industry,
      size,
      logo
    });

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/Superadmin
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).populate('admin', 'name email');

    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('admin', 'name email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private/Superadmin or Company Admin
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check authorization: superadmin or company's admin
    if (req.user.role !== 'superadmin' && 
        (!company.admin || company.admin.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    const { name, description, location, website, industry, size, logo } = req.body;

    company.name = name || company.name;
    company.description = description || company.description;
    company.location = location || company.location;
    company.website = website || company.website;
    company.industry = industry || company.industry;
    company.size = size || company.size;
    company.logo = logo || company.logo;

    const updatedCompany = await company.save();

    res.json({
      success: true,
      data: updatedCompany
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private/Superadmin
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    await company.deleteOne();

    res.json({
      success: true,
      message: 'Company removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};
