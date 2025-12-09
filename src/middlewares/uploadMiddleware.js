const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx|jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Allow specific mimetypes OR generic octet-stream (common in some upload scenarios)
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error(`Error: File type not allowed! Got mimetype: ${file.mimetype} for file: ${file.originalname}`));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    console.log('Multer Checking file:', file.originalname, file.mimetype);
    checkFileType(file, cb);
  },
});

module.exports = upload;
