import { Request, Response } from "express";
import { createPostSchema } from "./post.validation";
import {
  PostService,
  getPostsService,
  PostRepostService,
  PostLikeService,
  PostCommentService,
} from "./post.service";

interface AuthenticatedRequest extends Request {
  userId?: number;
  files?:
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[];
}

//CREATE POST
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedBody = createPostSchema.parse(req.body);
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const files: Express.Multer.File[] = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files || {}).flat();

    const newPost = await PostService.createPost(validatedBody, userId, files);
    // console.log(newPost);
    return res.status(201).json({ message: "Post created", post: newPost });
  } catch (err: any) {
    if (err.errors) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: err.errors });
    }
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to create post" });
  }
};

// FETCH POSTS
export const fetchPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const posts = await getPostsService(userId);
    // console.log(posts);

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message || "Failed to fetch posts" });
  }
};

//LIKE POST
export const likePostHandler = async (req: AuthenticatedRequest, res: Response) => {
  const postId = Number(req.params.id);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await PostLikeService.toggleLike(postId, userId);
    // console.log(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// COMMENT ON POST
export const commentPostHandler = async (req: AuthenticatedRequest, res: Response) => {
  const postId = Number(req.params.id);
  const userId = req.userId;
  const { content } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!content?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

  try {
    const comment = await PostCommentService.addComment(postId, userId, content);
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


//REPOST ON POST
export const repostPostHandler = async (req: AuthenticatedRequest, res: Response) => {
  const postId = Number(req.params.id);
  const userId = req.userId;
  const { repostComment } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await PostRepostService.repostPost(postId, userId, repostComment);
    res.json({ message: "Repost successful", ...result });
  } catch (err: any) {
    // res.status(400).json({ message: err.message });
    
  res.status(400).json({ message: err.message || "Something went wrong" });


  }
};
