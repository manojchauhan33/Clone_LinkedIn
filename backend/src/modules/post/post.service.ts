import { Post } from "./post.model";
import cloudinary from "../../config/cloudinary.config";
import PostLike from "./post.postLike";
import PostRepost from "./post.postRepost";
import { PostComment } from "./post.postComment";
import User from "../auth/user.model";
import Profile from "../profile/profile.model";

type AllowedMediaType = "image" | "video" | "document";

//Cloudnary
async function uploadToCloudinary(file: Express.Multer.File) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("video") ? "video" : "auto";
    const stream = cloudinary.uploader.upload_stream(
      { folder: "linked_clone/post", resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

// CREATE POST
export const PostService = {
  createPost: async (
    validatedBody: any,
    userId: number,
    files?: Express.Multer.File[]
  ) => {
    let media: { url: string; type: AllowedMediaType }[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const result: any = await uploadToCloudinary(file);
        let type: AllowedMediaType = "document";
        if (file.mimetype.startsWith("image")) type = "image";
        else if (file.mimetype.startsWith("video")) type = "video";

        media.push({ url: result.secure_url, type });
      }
    }

    if (
      !validatedBody.content &&
      media.length === 0 &&
      !validatedBody.originalPostId
    ) {
      const error = new Error(
        "Post must contain content, files, or be a repost."
      );
      (error as any).statusCode = 400;
      throw error;
    }

    const postData = { ...validatedBody, userId, media };
    const newPost = await Post.create(postData as any);
    return newPost.toJSON();
  },
};

// FETCH POSTS
export const getPostsService = async (userId: number) => {
  try {
    const posts = await Post.findAll({
      where: { isRepost: false },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "email"],
          include: [
            {
              model: Profile,
              as: "profile",
              attributes: ["name"],
            },
          ],
        },
        { model: Post, as: "originalPost" },
        { model: Post, as: "reposts" },
      ],
    });

    const likedPosts = await PostLike.findAll({ where: { userId } });
    const repostedPosts = await PostRepost.findAll({ where: { userId } });

    const likedPostIds = new Set(likedPosts.map((like) => like.postId));
    const repostedPostIds = new Set(repostedPosts.map((r) => r.postId));

    const enrichedPosts = posts.map((post: any) => ({
      ...post.toJSON(),
      likedByCurrentUser: likedPostIds.has(post.id),
      repostedByCurrentUser: repostedPostIds.has(post.id),
    }));

    return enrichedPosts;
  } catch (error) {
    throw new Error("Failed to fetch posts");
  }
};

// LIKE SERVICE
export const PostLikeService = {
  toggleLike: async (postId: number, userId: number) => {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error("Post not found");

    const existingLike = await PostLike.findOne({ where: { postId, userId } });

    if (existingLike) {
      await existingLike.destroy();
      post.likeCount = Math.max(0, post.likeCount - 1);
      await post.save();
      return { liked: false, likeCount: post.likeCount };
    }

    await PostLike.create({ postId, userId });
    post.likeCount += 1;
    await post.save();
    return { liked: true, likeCount: post.likeCount };
  },
};

// COMMENT SERVICE
export const PostCommentService = {
  addComment: async (postId: number, userId: number, content: string) => {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error("Post not found");

    const comment = await PostComment.create({ postId, userId, content });
    post.commentCount += 1;
    await post.save();

    return {
      commentId: comment.id,
      postId,
      userId,
      content: comment.content,
      createdAt: comment.createdAt,
    };
  },
};

// Repost logic
export const PostRepostService = {
  repostPost: async (
    postId: number,
    userId: number,
    repostComment?: string
  ) => {
    const originalPost = await Post.findByPk(postId);
    if (!originalPost) throw new Error("Post not found");

    if (!repostComment) {
      const alreadyReposted = await Post.findOne({
        where: {
          userId,
          originalPostId: postId,
          isRepost: true,
          repostComment: null,
        },
      });
      if (alreadyReposted) throw new Error("You already reposted this post");
    }

    // Create a repost post
    const repost = await Post.create({
      userId,
      content: originalPost.content,
      media: originalPost.media,
      hashtags: originalPost.hashtags,
      isRepost: true,
      originalPostId: originalPost.id,
      repostComment: repostComment || null,
      postType: originalPost.postType,
      lastActivityAt: new Date(),
    });

    // Store in PostRepost table
    await PostRepost.create({
      postId: originalPost.id,
      userId,
      content: repostComment || null,
    });

    // Update original post repost count
    originalPost.repostCount += 1;
    await originalPost.save();

    return {
      reposted: true,
      repostCount: originalPost.repostCount,
      repostId: repost.id,
    };
  },
};
