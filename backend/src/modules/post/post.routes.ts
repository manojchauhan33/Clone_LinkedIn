import { Router } from "express";
import {
  commentPostHandler,
  createPost,
  fetchPosts,
  likePostHandler,
  repostPostHandler,
} from "./post.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadMedia } from "../../middlewares/multer.middleware";

const router = Router();

router.post("/", authenticate, uploadMedia, createPost);
router.get("/", authenticate, fetchPosts);
router.post("/:id/like", authenticate, likePostHandler);
router.post("/:id/comment", authenticate, commentPostHandler);
router.post("/:id/repost", authenticate, repostPostHandler);

export default router;
