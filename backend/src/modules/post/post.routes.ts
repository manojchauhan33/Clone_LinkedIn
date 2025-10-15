import { Router } from "express";
import {
  commentPostHandler,
  createPost,
  fetchPosts,
  getPostCommentsHandler,
  getPostLikesHandler,
  getPostRepostsHandler,
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
router.get("/:id/likes", authenticate, getPostLikesHandler);
router.get("/:id/comments",authenticate,getPostCommentsHandler);
router.get("/:id/reposts",authenticate,getPostRepostsHandler);

export default router;