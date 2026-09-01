import multer from 'multer';

// Memory storage only — the PDF buffer lives in RAM just long enough to be
// extracted and chunked (see pdfExtractionService.js), then is discarded.
// Nothing is ever written to disk. This matches Render's free-tier ephemeral
// filesystem and the decision to never persist raw uploaded files.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files are allowed.'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB — keeps chunk count and processing time bounded
  }
});

export default upload;