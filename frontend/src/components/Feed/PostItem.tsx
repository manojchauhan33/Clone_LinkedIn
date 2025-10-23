import React, {
  memo,
  //  useState
} from "react";
import {
  Post as PostType,
  //  PostRepostUser
} from "../../api/Post";

import {
  AiOutlineLike,
  AiOutlineComment,
  AiOutlineRetweet,
} from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { BiCommentDetail } from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";

// const RepostModal = React.lazy(() => import("./RepostModal"));
// const MediaLightbox = React.lazy(() => import("./MediaLightbox"));
const ReactionsBox = React.lazy(() => import("./ReactionsBox"));
// const RepostDialog = React.lazy(() => import("./RepostDialog"));

export interface RepostingPost {
  post: PostType;
  openDropdown: boolean;
}

export interface MediaItem {
  type: "image" | "video" | "document";
  url: string;
}

export interface PostCommentUser {
  commentId?: number;
  id?: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

interface PostItemProps {
  post: PostType;
  isLiked: boolean;
  isReposted: boolean;
  isCommentSectionOpen: boolean;
  commentText: string;
  comments: PostCommentUser[];
  showEmojiPicker: boolean;
  isRepostDropdownOpen: boolean;
  activeLikesBoxId: number | null;

  timeSince: (dateString: string) => string;
  handleLike: (postId: number) => void;
  handleShowComments: (postId: number) => Promise<void>;
  handleCommentChange: (postId: number, text: string) => void;
  handleCommentSubmit: (postId: number) => Promise<void>;
  handleRepost: (postId: number, comment?: string) => Promise<void>; // Direct repost

  setLightbox: React.Dispatch<
    React.SetStateAction<{ media: MediaItem[]; index: number } | null>
  >;
  setActiveLikesBox: React.Dispatch<React.SetStateAction<number | null>>;
  setShowEmojiPickerFor: React.Dispatch<React.SetStateAction<number | null>>;
  setReposting: React.Dispatch<React.SetStateAction<RepostingPost | null>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<PostType | null>>;
  handleShowReposts: (post: PostType) => Promise<void>;

  // Infinite Scroll Ref
  isLastPost: boolean;
  lastPostRef: ((node: HTMLDivElement) => (() => void) | undefined) | null;
}

const PostItem: React.FC<PostItemProps> = memo(
  ({
    post,
    isLiked,
    isReposted,
    isCommentSectionOpen,
    commentText,
    comments,
    showEmojiPicker,
    isRepostDropdownOpen,
    activeLikesBoxId,
    timeSince,
    handleLike,
    handleShowComments,
    handleCommentChange,
    handleCommentSubmit,
    handleRepost,
    setLightbox,
    setActiveLikesBox,
    setShowEmojiPickerFor,
    setReposting,
    setIsModalOpen,
    handleShowReposts,
    isLastPost,
    lastPostRef,
  }) => {
    const authorName = post.author?.profile?.name || "Unknown";
    const postDate = post.createdAt ? timeSince(post.createdAt) : "";
    const media = post.media || [];

    return (
      <div
        ref={isLastPost ? lastPostRef : null}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
      >
        {/* owner */}
        <div className="flex items-start gap-3 mb-3">
          <MdAccountCircle className="w-10 h-10 text-gray-500 rounded-full flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800">{authorName}</p>
            <p className="text-sm text-gray-500">{postDate} ago</p>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed mb-4 text-base">
            {post.content}
          </div>
        )}

        {/* Media */}
        {media.length > 0 && (
          <PostMediaGrid
            media={media}
            onClick={(index) => setLightbox({ media, index })}
          />
        )}

        <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3 mt-3 relative">
          <span
            className="cursor-pointer hover:text-blue-600 relative"
            onClick={() =>
              setActiveLikesBox(activeLikesBoxId === post.id ? null : post.id)
            }
          >
            <span className="font-semibold">{post.likeCount}</span> Likes
            {activeLikesBoxId === post.id && (
              <ReactionsBox
                postId={post.id}
                onClose={() => setActiveLikesBox(null)}
              />
            )}
          </span>

          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => handleShowComments(post.id)}
          >
            <span className="font-semibold">{post.commentCount}</span> Comments
          </span>

          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => handleShowReposts(post)}
          >
            <span className="font-semibold">{post.repostCount}</span> Reposts
          </span>
        </div>

        <div className="flex justify-around text-gray-600 mt-2 border-t border-gray-100 pt-2">
          <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 ${
              isLiked ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <AiOutlineLike size={20} />
            <span className="hidden sm:inline">Like</span>
          </button>

          <button
            onClick={() => handleShowComments(post.id)}
            className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100"
          >
            <AiOutlineComment size={20} />
            <span className="hidden sm:inline">Comment</span>
          </button>

          <div className="relative flex flex-col items-center gap-1">
            <button
              onClick={() =>
                setReposting(
                  isRepostDropdownOpen ? null : { post, openDropdown: true }
                )
              }
              className={`flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 ${
                isReposted ? "text-green-600" : "text-gray-600"
              }`}
            >
              <AiOutlineRetweet size={20} />
              <span className="hidden sm:inline">Repost</span>
            </button>

            {isRepostDropdownOpen && (
              <div
                className="absolute top-10 right-0 bg-white border border-gray-200 rounded-xl shadow-lg w-64 z-20 overflow-hidden"
                onMouseLeave={() => setReposting(null)}
              >
                <button
                  onClick={() => {
                    setIsModalOpen(post);
                    setReposting(null);
                  }}
                  className="flex flex-col items-start w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BiCommentDetail className="text-gray-600 text-lg" />
                    <span className="text-sm font-semibold text-gray-800">
                      Repost with your thoughts
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pl-7">
                    Create a new post with this post attached
                  </p>
                </button>

                <button
                  onClick={() => handleRepost(post.id)}
                  className="flex flex-col items-start w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <AiOutlineRetweet className="text-gray-600 text-lg" />
                    <span className="text-sm font-semibold text-gray-800">
                      Repost
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pl-7">
                    Instantly share this post to your feed
                  </p>
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100">
            <IoIosSend size={20} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Comments Section */}
        {isCommentSectionOpen && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2 items-start">
              <MdAccountCircle className="w-10 h-10 text-gray-400 rounded-full flex-shrink-0" />
              <div className="flex-1 flex flex-col">
                <div className="flex items-center border border-gray-300 rounded-full px-3 py-1">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) =>
                      handleCommentChange(post.id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCommentSubmit(post.id);
                    }}
                    className="flex-1 outline-none py-2 px-1 rounded-full"
                  />
                  <BsEmojiSmile
                    size={22}
                    className="text-gray-500 cursor-pointer hover:text-yellow-500 ml-2"
                    onClick={() =>
                      setShowEmojiPickerFor(showEmojiPicker ? null : post.id)
                    }
                  />
                </div>

                {commentText.trim() && (
                  <button
                    className="mt-1 bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700 transition self-end"
                    onClick={() => handleCommentSubmit(post.id)}
                  >
                    Send
                  </button>
                )}
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute z-50 bottom-12 left-0">
                <EmojiPicker
                  onEmojiClick={(emojiData) =>
                    handleCommentChange(post.id, commentText + emojiData.emoji)
                  }
                  width={300}
                  height={350}
                />
              </div>
            )}

            <div className="space-y-3 mt-2">
              {(comments || []).map((comment) => (
                <div
                  key={comment.commentId ?? comment.id ?? Math.random()}
                  className="flex gap-2"
                >
                  <MdAccountCircle className="w-8 h-8 text-gray-400 rounded-full flex-shrink-0" />
                  <div className="bg-gray-100 rounded-xl px-3 py-2 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {comment.user?.name ?? "Unknown"}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {comment.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {timeSince(comment.createdAt)} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export const PostMediaGrid: React.FC<{
  media: MediaItem[];
  onClick?: (index: number) => void;
}> = ({ media, onClick }) => {
  const count = media.length;
  if (count === 0) return null;

  // Single document case
  if (count === 1 && media[0].type === "document") {
    const doc = media[0];
    const fileName = doc.url.split("/").pop() || "Document File";
    const fileExtension = fileName.split(".").pop()?.toUpperCase() || "DOC";

    return (
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex items-center p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition shadow-md"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 text-blue-600 rounded-lg flex-shrink-0 mr-4">
          <FaRegFileAlt className="text-xl" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-gray-800 truncate">{fileName}</p>
          <p className="text-sm text-gray-500 mt-1">{fileExtension}</p>
        </div>
        <FaRegFileAlt className="text-blue-600 text-xl ml-4 sm:hidden" />
      </a>
    );
  }

  const MediaCard: React.FC<{
    media: MediaItem;
    onClick?: () => void;
    maxHeight: string;
  }> = ({ media, onClick, maxHeight }) => (
    <div
      className={`relative cursor-pointer ${maxHeight} rounded`}
      onClick={onClick}
    >
      {media.type === "video" ? (
        <video
          src={media.url}
          controls
          className="w-full h-full object-cover rounded-sm"
        />
      ) : (
        <img
          src={media.url}
          className="w-full h-full object-cover rounded-sm"
          alt=""
        />
      )}
    </div>
  );

  if (count === 1) {
    return (
      <div className="mb-4">
        <MediaCard
          media={media[0]}
          onClick={() => onClick?.(0)}
          maxHeight="max-h-96"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mb-4 grid grid-cols-2 gap-1">
        {media.map((m, i) => (
          <MediaCard
            key={i}
            media={m}
            onClick={() => onClick?.(i)}
            maxHeight="h-48"
          />
        ))}
      </div>
    );
  }

  
  if (count === 3) {
    return (
      <div className="mb-4 grid gap-1">
        <MediaCard
          media={media[0]}
          onClick={() => onClick?.(0)}
          maxHeight="max-h-72"
        />
        <div className="grid grid-cols-2 gap-1 mt-.5">
          {media.slice(1, 3).map((m, i) => (
            <MediaCard
              key={i + 1}
              media={m}
              onClick={() => onClick?.(i + 1)}
              maxHeight="h-48"
            />
          ))}
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="mb-4 grid grid-cols-2 gap-1">
        {media.map((m, i) => (
          <MediaCard
            key={i}
            media={m}
            onClick={() => onClick?.(i)}
            maxHeight="h-48"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4 grid gap-1 relative">
      <div className="grid grid-cols-2 gap-1">
        {media.slice(0, 4).map((m, i) => (
          <div key={i} className="relative">
            <MediaCard
              media={m}
              onClick={() => onClick?.(i)}
              maxHeight="h-48"
            />
            {i === 3 && count > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold rounded">
                +{count - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostItem;
