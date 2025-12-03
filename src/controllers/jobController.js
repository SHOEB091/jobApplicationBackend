const Job = require('../models/Job');
const Company = require('../models/Company');
const Category = require('../models/Category');
const { jobSchema } = require('../utils/validationSchemas');

// @desc    Fetch all jobs with search and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    // Add category filter if provided
    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    const filters = { ...keyword, ...categoryFilter };

    const count = await Job.countDocuments({ ...filters });
    const jobs = await Job.find({ ...filters })
      .populate('company', 'name location logo')
      .populate('category', 'name slug')
      .populate('user', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Fetch single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name location description website logo')
      .populate('category', 'name description slug')
      .populate('user', 'name email');

    if (job) {
      res.json({
        success: true,
        data: job
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get jobs by company
// @route   GET /api/jobs/company/:companyId
// @access  Public
const getJobsByCompany = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.params.companyId })
      .populate('company', 'name location logo')
      .populate('category', 'name slug')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin or Superadmin
const createJob = async (req, res) => {
  try {
    const { error } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, company, category, location, description, salary, tags } = req.body;

    // Verify company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Verify category exists and is active
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    if (!categoryExists.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This category is not active'
      });
    }

    // Check authorization
    if (req.user.role === 'admin') {
      // Admin can only create jobs for their own company
      if (req.user.company.toString() !== company) {
        return res.status(403).json({
          success: false,
          message: 'You can only create jobs for your own company'
        });
      }
    }
    // Superadmin can create jobs for any company

    const job = new Job({
      user: req.user._id,
      title,
      company,
      category,
      location,
      description,
      salary,
      tags,
    });

    const createdJob = await job.save();
    const populatedJob = await Job.findById(createdJob._id)
      .populate('company', 'name location logo')
      .populate('category', 'name slug')
      .populate('user', 'name');

    res.status(201).json({
      success: true,
      data: populatedJob
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin or Superadmin
const updateJob = async (req, res) => {
  try {
    const { title, company, category, location, description, salary, tags } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check authorization
    if (req.user.role === 'admin') {
      // Admin can only update jobs from their own company
      if (job.company.toString() !== req.user.company.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this job'
        });
      }
    }
    // Superadmin can update any job

    // Verify category if being updated
    if (category && category !== job.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      if (!categoryExists.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This category is not active'
        });
      }
    }

    job.title = title || job.title;
    job.company = company || job.company;
    job.category = category || job.category;
    job.location = location || job.location;
    job.description = description || job.description;
    job.salary = salary || job.salary;
    job.tags = tags || job.tags;

    const updatedJob = await job.save();
    const populatedJob = await Job.findById(updatedJob._id)
      .populate('company', 'name location logo')
      .populate('category', 'name slug')
      .populate('user', 'name');

    res.json({
      success: true,
      data: populatedJob
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin or Superadmin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check authorization
    if (req.user.role === 'admin') {
      // Admin can only delete jobs from their own company
      if (job.company.toString() !== req.user.company.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this job'
        });
      }
    }
    // Superadmin can delete any job

    await job.deleteOne();
    
    res.json({
      success: true,
      message: 'Job removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get jobs by category
// @route   GET /api/jobs/category/:categoryId
// @access  Public
const getJobsByCategory = async (req, res) => {
  try {
    const jobs = await Job.find({ category: req.params.categoryId })
      .populate('company', 'name location logo')
      .populate('category', 'name slug')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getJobs,
  getJobById,
  getJobsByCompany,
  getJobsByCategory,
  createJob,
  updateJob,
  deleteJob,
};
