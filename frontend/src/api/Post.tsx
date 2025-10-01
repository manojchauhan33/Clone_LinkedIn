import api from "./axois";
import { AxiosError } from "axios";
import { APIErrorResponse } from "../types/errors"; 


export interface CreatePostPayload {
  content?: string | null;
  hashtags?: string | null;
  isRepost?: boolean;
  originalPostId?: number | null;
  repostComment?: string | null;
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
    mediaFiles.forEach((file) => {
      formData.append("media", file);
    });
  }

  if (data.content) formData.append("content", data.content);
  if (data.hashtags) formData.append("hashtags", data.hashtags);
  if (data.repostComment) formData.append("repostComment", data.repostComment);
  if (data.isRepost !== undefined) formData.append("isRepost", String(data.isRepost));
  if (data.originalPostId) formData.append("originalPostId", String(data.originalPostId));

  try {
    const res = await api.post<PostResponse>("/posts", formData, { 
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw error.response.data as APIErrorResponse || { message: "Unknown API error" };
    }
    throw error;
  }
};