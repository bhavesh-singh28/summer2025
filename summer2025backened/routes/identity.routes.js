import express from 'express';
import multer from 'multer';
import { verifyIdentity } from '../controllers/identity.controller.js';

const router = express.Router();

// Save to temporary folder
const upload = multer({ dest: 'temp_uploads/' });

router.post(
  '/verify',
  upload.fields([
    { name: 'document_image', maxCount: 10 },
    { name: 'live_image', maxCount: 10 }
  ]),
  verifyIdentity
);

export default router;
