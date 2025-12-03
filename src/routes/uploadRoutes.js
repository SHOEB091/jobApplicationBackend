const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');

router.post('/', upload.single('resume'), (req, res) => {
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

module.exports = router;
