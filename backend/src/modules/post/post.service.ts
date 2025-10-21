import { Post } from "./post.model";
import cloudinary from "../../config/cloudinary.config";
import PostLike from "./post.postLike";
import PostRepost from "./post.postRepost";
import { PostComment } from "./post.postComment";
import User from "../auth/user.model";
import Profile from "../profile/profile.model";
import { withTransaction } from "../../utils/transaction";

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
export const getPostsService = async (userId: number, page = 1, limit = 5) => {
  const offset = (page - 1) * limit;

  try {
    const posts = await Post.findAll({
      where: { isRepost: false },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "email"],
          include: [{ model: Profile, as: "profile", attributes: ["name"] }],
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
    return withTransaction(async (t) => {
      const post = await Post.findByPk(postId, { transaction: t });
      if (!post) throw new Error("Post not found");

      const existingLike = await PostLike.findOne({
        where: { postId, userId },
        transaction: t,
      });

      if (existingLike) {
        await existingLike.destroy({ transaction: t });
        post.likeCount = Math.max(0, post.likeCount - 1);
      } else {
        await PostLike.create({ postId, userId }, { transaction: t });
        post.likeCount += 1;
      }

      await post.save({ transaction: t });

      return { liked: !existingLike, likeCount: post.likeCount };
    });
  },
};

// COMMENT SERVICE
export const PostCommentService = {
  addComment: async (postId: number, userId: number, content: string) => {
    return withTransaction(async (t) => {
      const post = await Post.findByPk(postId, { transaction: t });
      if (!post) throw new Error("Post not found");

      const comment = await PostComment.create(
        { postId, userId, content },
        { transaction: t }
      );

      post.commentCount += 1;
      await post.save({ transaction: t });

      return {
        commentId: comment.id,
        postId,
        userId,
        content: comment.content,
        createdAt: comment.createdAt,
      };
    });
  },
};

//REPOST
export const PostRepostService = {
  repostPost: async (
    postId: number,
    userId: number,
    repostComment?: string
  ) => {
    return withTransaction(async (t) => {
      try {
        const originalPost = await Post.findByPk(postId, { transaction: t });
        if (!originalPost) throw new Error("Post not found");

        const trimmedComment = repostComment?.trim() || null;

        if (!trimmedComment) {
          const existingPlainRepost = await Post.findOne({
            where: {
              userId,
              originalPostId: postId,
              isRepost: true,
              repostComment: null,
            },
            transaction: t,
          });

          if (existingPlainRepost) {
            throw new Error("You already reposted this post");
          }

          const newRepost = await Post.create(
            {
              userId,
              content: originalPost.content,
              media: originalPost.media,
              hashtags: originalPost.hashtags || "",
              isRepost: true,
              originalPostId: originalPost.id,
              repostComment: null,
              postType: originalPost.postType,
              lastActivityAt: new Date(),
            },
            { transaction: t }
          );

          await PostRepost.create(
            {
              postId: originalPost.id,
              userId,
              content: null,
            },
            { transaction: t }
          );

          originalPost.repostCount += 1;
          originalPost.lastActivityAt = new Date();
          await originalPost.save({ transaction: t });

          return {
            type: "simple",
            reposted: true,
            repostCount: originalPost.repostCount,
            repostId: newRepost.id,
            originalPostId: originalPost.id,
          };
        }

        const existingThoughtRepost = await Post.findOne({
          where: {
            userId,
            originalPostId: postId,
            isRepost: true,
            repostComment: trimmedComment,
          },
          transaction: t,
        });

        if (existingThoughtRepost) {
          throw new Error(
            "You already reposted this post with the same thought"
          );
        }

        const newRepostWithComment = await Post.create(
          {
            userId,
            // content: trimmedComment,
            content: originalPost.content,
            media: originalPost.media,
            hashtags: originalPost.hashtags || "",
            isRepost: true,
            originalPostId: originalPost.id,
            repostComment: trimmedComment,
            postType: originalPost.postType,
            lastActivityAt: new Date(),
          },
          { transaction: t }
        );

        await PostRepost.create(
          {
            postId: originalPost.id,
            userId,
            content: trimmedComment,
          },
          { transaction: t }
        );

        originalPost.repostCount += 1;
        originalPost.lastActivityAt = new Date();
        await originalPost.save({ transaction: t });

        return {
          type: "with_thought",
          reposted: true,
          repostCount: originalPost.repostCount,
          repostId: newRepostWithComment.id,
          originalPostId: originalPost.id,
          repostComment: newRepostWithComment.repostComment,
        };
      } catch (err) {
        // console.error("Error", err);
        throw err;
      }
    });
  },
};

// LIKE
interface LikeWithUser {
  likeId: number;
  user: { id: number; email: string; name?: string | null };
  createdAt: Date;
}

export const getPostLikesService = async (
  postId: number
): Promise<LikeWithUser[]> => {
  const post = await Post.findByPk(postId);
  if (!post)
    throw Object.assign(new Error("Post not found"), { statusCode: 404 });

  const likes = await PostLike.findAll({
    where: { postId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "email"],
        include: [{ model: Profile, as: "profile", attributes: ["name"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return likes.map((like: any) => ({
    likeId: like.id,
    user: {
      id: like.user?.id ?? null,
      email: like.user?.email ?? null,
      name: like.user?.profile?.name ?? null,
    },
    createdAt: like.createdAt,
  }));
};

// COMMENT
interface CommentWithUser {
  commentId: number;
  content: string;
  user: { id: number; email: string; name?: string | null };
  createdAt: Date;
}

export const getPostCommentsService = async (
  postId: number
): Promise<CommentWithUser[]> => {
  const post = await Post.findByPk(postId);
  if (!post)
    throw Object.assign(new Error("Post not found"), { statusCode: 404 });

  const comments = await PostComment.findAll({
    where: { postId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "email"],
        include: [{ model: Profile, as: "profile", attributes: ["name"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return comments.map((comment: any) => ({
    commentId: comment.id,
    content: comment.content,
    user: {
      id: comment.user?.id ?? null,
      email: comment.user?.email ?? null,
      name: comment.user?.profile?.name ?? null,
    },
    createdAt: comment.createdAt,
  }));
};

// REPOST

// interface RepostWithUser {
//   repostId: number;
//   content: string | null; // user’s comment on top
//   media: any[];            // original post media
//   hashtags: string | null; // original post hashtags
//   repostComment: string | null; // optional user comment
//   user: { id: number | null; email: string | null; name: string | null };
//   originalPost: {        // embedded original post
//     id: number;
//     content: string | null;
//     media: any[];
//     hashtags: string | null;
//     author: { id: number; name: string | null; email: string | null };
//   };
//   createdAt: Date;
// }
// export const getPostRepostsService = async (
//   postId: number
// ): Promise<RepostWithUser[]> => {
//   const post = await Post.findByPk(postId);
//   if (!post) throw Object.assign(new Error("Post not found"), { statusCode: 404 });

//   const reposts = await PostRepost.findAll({
//     where: { postId },
//     include: [
//       {
//         model: Post,
//         as: "repostPost",
//         include: [
//           {
//             model: User,
//             as: "author",
//             attributes: ["id", "email"],
//             include: [{ model: Profile, as: "profile", attributes: ["name"] }],
//           },
//         ],
//       },
//       {
//         model: User,
//         as: "user",
//         attributes: ["id", "email"],
//         include: [{ model: Profile, as: "profile", attributes: ["name"] }],
//       },
//     ],
//     order: [["createdAt", "DESC"]],
//   });

//   // return reposts.map((r: any) => ({
//   //   repostId: r.id,
//   //   content: r.repostPost?.repostComment ?? null, // only user’s comment
//   //   media: r.repostPost?.media ?? [],             // show original media
//   //   hashtags: r.repostPost?.hashtags ?? null,
//   //   repostComment: r.repostPost?.repostComment ?? null,
//   //   user: {
//   //     id: r.user?.id ?? r.repostPost?.author?.id ?? null,
//   //     email: r.user?.email ?? r.repostPost?.author?.email ?? null,
//   //     name: r.user?.profile?.name ?? r.repostPost?.author?.profile?.name ?? null,
//   //   },
//   //   originalPost: {
//   //     id: r.repostPost?.id,
//   //     content: r.repostPost?.content,
//   //     media: r.repostPost?.media ?? [],
//   //     hashtags: r.repostPost?.hashtags ?? null,
//   //     author: {
//   //       id: r.repostPost?.author?.id,
//   //       name: r.repostPost?.author?.profile?.name ?? null,
//   //       email: r.repostPost?.author?.email ?? null,
//   //     },
//   //   },
//   //   createdAt: r.createdAt,
//   // }));

//   return reposts.map((r: any) => ({
//     repostId: r.id,
//     repostComment: r.repostComment ?? null,  // The comment the reposting user added
//     createdAt: r.createdAt,
//     user: { // The user who reposted
//       id: r.user?.id ?? null,
//       email: r.user?.email ?? null,
//       name: r.user?.profile?.name ?? null,
//     },
//     originalPost: { // The post being reposted
//       id: r.repostPost?.id ?? null,
//       content: r.repostPost?.content ?? null,
//       media: r.repostPost?.media ?? [],
//       hashtags: r.repostPost?.hashtags ?? null,
//       author: { // Author of the original post
//         id: r.repostPost?.author?.id ?? null,
//         email: r.repostPost?.author?.email ?? null,
//         name: r.repostPost?.author?.profile?.name ?? null,
//       },
//       createdAt: r.repostPost?.createdAt ?? null,
//     },
//   }));

// };

interface UserProfile {
  name: string | null;
}

interface UserWithProfile {
  id: number;
  email: string;
  profile?: UserProfile;
}

interface PostWithAuthor extends Post {
  author?: UserWithProfile;
}

interface PostRepostWithExtras extends PostRepost {
  repostComment?: string | null;
  createdAt: Date;
  repostPost?: PostWithAuthor;
  user?: UserWithProfile;
}

interface RepostWithUser {
  repostId: number;
  repostComment: string | null;
  createdAt: Date;
  user: {
    id: number | null;
    email: string | null;
    name: string | null;
  };
  originalPost: {
    id: number | null;
    content: string | null;
    media: any[];
    hashtags: string | null;
    createdAt: Date | null;
    author: {
      id: number | null;
      email: string | null;
      name: string | null;
    };
  };
}

interface PostRepostsResponse {
  originalPost: {
    id: number;
    content: string | null;
    media: any[];
    hashtags: string | null;
    createdAt: Date;
    author: {
      id: number | null;
      email: string | null;
      name: string | null;
    };
  };
  reposts: RepostWithUser[];
}

export const getPostRepostsService = async (
  postId: number
): Promise<PostRepostsResponse> => {
  const post = (await Post.findByPk(postId, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "email"],
        include: [{ model: Profile, as: "profile", attributes: ["name"] }],
      },
    ],
  })) as PostWithAuthor;

  if (!post)
    throw Object.assign(new Error("Post not found"), { statusCode: 404 });

  const reposts = (await Post.findAll({
    where: { originalPostId: postId, isRepost: true },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "email"],
        include: [{ model: Profile, as: "profile", attributes: ["name"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
  })) as PostWithAuthor[];

  const formattedReposts: RepostWithUser[] = reposts.map((r) => ({
    repostId: r.id,
    repostComment: r.repostComment ?? null,
    createdAt: r.createdAt,
    user: {
      id: r.author?.id ?? null,
      email: r.author?.email ?? null,
      name: r.author?.profile?.name ?? null,
    },
    originalPost: {
      id: post.id,
      content: post.content ?? null,
      media: post.media ?? [],
      hashtags: post.hashtags ?? null,
      createdAt: post.createdAt ?? null,
      author: {
        id: post.author?.id ?? null,
        email: post.author?.email ?? null,
        name: post.author?.profile?.name ?? null,
      },
    },
  }));

  return {
    originalPost: {
      id: post.id,
      content: post.content ?? null,
      media: post.media ?? [],
      hashtags: post.hashtags ?? null,
      createdAt: post.createdAt ?? null,
      author: {
        id: post.author?.id ?? null,
        email: post.author?.email ?? null,
        name: post.author?.profile?.name ?? null,
      },
    },
    reposts: formattedReposts,
  };
};
