import { Request, Response } from "express";
import { createPostSchema } from "./post.validation";
import { PostService } from "./post.service";
import logger from "../../utils/logger";

export const createPost = async (req: Request, res: Response) => {
  try {
    const validatedBody = createPostSchema.parse(req.body);

    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const files = req.files as Express.Multer.File[];

    const newPost = await PostService.createPost(validatedBody, userId, files);
    logger.info(newPost);

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ message: "Validation failed", errors: err.errors });
    }
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to create post" });
  }
};
