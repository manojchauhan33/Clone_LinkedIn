import { Router } from 'express';
import { createPost } from './post.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadMedia } from '../../middlewares/multer.middleware';

const router = Router();

router.post('/', authenticate, uploadMedia, createPost);

export default router;
