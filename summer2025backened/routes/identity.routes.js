import express from 'express';
import multer from 'multer';
import { verifyIdentity } from '../controllers/identity.controller.js';

const router = express.Router();

const upload = multer({ dest: 'temp_uploads/' });

router.post('/verify', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'live', maxCount: 1 }
]), verifyIdentity);

export default router;
