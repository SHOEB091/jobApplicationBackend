const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const jobSchema = Joi.object({
  title: Joi.string().required(),
  company: Joi.string().min(2).required(), // Changed from ObjectId to string
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // MongoDB ObjectId
  location: Joi.string().required(),
  description: Joi.string().required(),
  salary: Joi.number().required(),
  tags: Joi.array().items(Joi.string()),
});

const companySchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  website: Joi.string().uri().optional(),
  industry: Joi.string().optional(),
  size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+').optional(),
  logo: Joi.string().uri().optional(),
});

const adminRequestSchema = Joi.object({
  companyId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  message: Joi.string().optional(),
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  jobSchema,
  companySchema,
  adminRequestSchema,
  categorySchema,
};
