const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Job = require('../src/models/Job');

const checkJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const jobs = await Job.find({});
    console.log(`Found ${jobs.length} jobs`);
    console.log(JSON.stringify(jobs, null, 2));

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkJobs();
