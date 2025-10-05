import api from "./axois";
import { AxiosError } from "axios";
import { APIErrorResponse } from "../types/errors";

export interface CreatePostPayload {
  content?: string | null;
  hashtags?: string | null;
  isRepost?: boolean;
  originalPostId?: number | null;
  repostComment?: string | null;
  postType?: "public" | "connection-only";
  postFormat?: "standard" | "article";
}

export interface PostResponse {
  id: number;
  content: string;
}

export const createPost = async (
  data: CreatePostPayload,
  mediaFiles?: File[] | null
): Promise<PostResponse> => {
  const formData = new FormData();

  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file) => formData.append("media", file));
  }

  if (data.content) formData.append("content", data.content);
  if (data.hashtags) formData.append("hashtags", data.hashtags);
  if (data.repostComment) formData.append("repostComment", data.repostComment);
  if (data.isRepost !== undefined)
    formData.append("isRepost", String(data.isRepost));
  if (data.originalPostId)
    formData.append("originalPostId", String(data.originalPostId));
  if (data.postType) formData.append("postType", data.postType);
  if (data.postFormat) formData.append("postFormat", data.postFormat);

  try {
    const res = await api.post<PostResponse>("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw (
        (error.response.data as APIErrorResponse) || {
          message: "Unknown API error",
        }
      );
    }
    throw error;
  }
};

//get
export interface AuthorProfile {
  name: string;
}

export interface PostAuthor {
  id: number;
  email: string;
  profile: AuthorProfile;
}

export interface Post {
  id: number;
  userId: number;
  content: string | null;
  media: { url: string; type: "image" | "video" | "document" }[] | null;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  createdAt: string;
  author: PostAuthor;
  originalPost?: Post | null;
  likedByCurrentUser?: boolean;
  repostedByCurrentUser?: boolean;
}

export interface FetchPostsResponse {
  message: string;
  posts: Post[];
}

export const fetchAllPosts = async (): Promise<Post[]> => {
  try {
    const res = await api.get<FetchPostsResponse>("/posts");
    return res.data.posts;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw (
        (error.response.data as APIErrorResponse) || {
          message: "Failed to fetch posts",
        }
      );
    }
    throw error;
  }
};

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export const likePost = async (postId: number): Promise<LikeResponse> => {
  try {
    const res = await api.post<LikeResponse>(`/posts/${postId}/like`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw (
        (error.response.data as APIErrorResponse) || {
          message: "Failed to like post",
        }
      );
    }
    throw error;
  }
};

export interface Comment {
  userId: number;
  content: string;
  createdAt: string;
}

export interface CommentResponse {
  commentCount: number;
  comment: Comment;
}

export const commentPost = async (
  postId: number,
  content: string
): Promise<CommentResponse> => {
  try {
    const res = await api.post<CommentResponse>(`/posts/${postId}/comment`, {
      content,
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw (
        (error.response.data as APIErrorResponse) || {
          message: "Failed to comment on post",
        }
      );
    }
    throw error;
  }
};

export interface RepostResponse {
  reposted: boolean;
  repostCount: number;
}

export const repostPost = async (
  postId: number,
  repostComment?: string
): Promise<RepostResponse> => {
  try {
    const res = await api.post<RepostResponse>(`/posts/${postId}/repost`, {
      repostComment,
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw (
        (error.response.data as APIErrorResponse) || {
          message: "Failed to repost",
        }
      );
    }
    throw error;
  }
};
