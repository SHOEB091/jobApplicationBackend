const Job = require('../models/Job');
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

    console.log('getJobs filters:', JSON.stringify(filters, null, 2));

    const count = await Job.countDocuments({ ...filters });
    console.log('getJobs count:', count);

    const jobs = await Job.find({ ...filters })
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

    const { title, company, category, location, description, tags, applicationUrl } = req.body;


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

    // Only superadmin can create jobs
    const job = new Job({
      user: req.user._id,
      title,
      company,
      category,
      location,
      description,
      tags,
      applicationUrl,
    });

    const createdJob = await job.save();
    const populatedJob = await Job.findById(createdJob._id)
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
    const { title, company, category, location, description, tags, applicationUrl } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }


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
    job.tags = tags || job.tags;
    job.applicationUrl = applicationUrl || job.applicationUrl;

    const updatedJob = await job.save();
    const populatedJob = await Job.findById(updatedJob._id)
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
