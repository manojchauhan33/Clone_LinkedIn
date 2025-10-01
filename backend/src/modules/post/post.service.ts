import { Post } from "./post.model";
import cloudinary from "../../config/cloudinary.config";

type AllowedMediaType = "image" | "video" | "document";

async function uploadToCloudinary(file: Express.Multer.File) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "linked_clone/post", resource_type: "auto" }, // all posts under linked_clone/post
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

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
        if (file.mimetype.startsWith("image")){ 
          type = "image";
        }
        else if(file.mimetype.startsWith("video")){ 
          type = "video";
        }

        media.push({ url: result.secure_url, type });
      }
    }

    if (!validatedBody.content && media.length === 0 && !validatedBody.originalPostId) {
      const error = new Error("Post must contain content, files, or be a repost.");
      (error as any).statusCode = 400;
      throw error;
    }

    const postData = {
      ...validatedBody,
      userId,
      media,
    };

    // console.log(postData);

    try {
      const newPost = await Post.create(postData as any);
      return newPost.toJSON();
    } catch (error) {
      console.error("PostService Error:", error);
      throw new Error("Database operation failed during post creation.");
    }
  },
};
