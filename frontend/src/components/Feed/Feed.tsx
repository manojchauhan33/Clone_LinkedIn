import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAllPosts,
  Post as PostType,
  likePost,
  repostPost,
  commentPost,
  // getPostLikes,
  getPostComments,
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
import RepostModal from "./RepostModal";
import MediaLightbox from "./MediaLightbox";
import { useAuth } from "../../context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import ReactionsBox from "./ReactionsBox";

interface RepostingPost {
  post: PostType;
  openDropdown: boolean;
}

interface MediaItem {
  type: "image" | "video" | "document";
  url: string;
}

interface PostCommentUser {
  commentId?: number;
  id?: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [commentTextMap, setCommentTextMap] = useState<Record<number, string>>({});
  const [commentsMap, setCommentsMap] = useState<Record<number, PostCommentUser[]>>({});
  const [reposting, setReposting] = useState<RepostingPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<PostType | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<number>>(new Set());
  const [repostPending, setRepostPending] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<{media: MediaItem[];index: number;} | null>(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<number | null>(null );
  const [activeLikesBox, setActiveLikesBox] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || !hasMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setPage((prev) => prev + 1);
          }
        },
        {
          root: null, // viewport
          rootMargin: "0px",
          threshold: 0.1,
        }
      );

      if (node) {
        observer.observe(node);
      }

      return () => {
        if (node) {
          observer.unobserve(node);
        }
      };
    },
    [loading, hasMore]
  );

  // Fetch posts
  // useEffect(() => {
  //   const loadPosts = async () => {
  //     try {
  //       const fetchedPosts = await fetchAllPosts();
  //       const likedSet = new Set<number>();
  //       const repostedSet = new Set<number>();
  //       fetchedPosts.forEach((post) => {
  //         if (post.likedByCurrentUser) likedSet.add(post.id);
  //         if (post.repostedByCurrentUser) repostedSet.add(post.id);
  //       });
  //       setPosts(fetchedPosts);
  //       setLikedPosts(likedSet);
  //       setRepostedPosts(repostedSet);
  //     } catch (err: unknown) {
  //       if (err instanceof Error) setError(err.message);
  //       else setError("Failed to fetch posts");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadPosts();
  // }, []);

  useEffect(() => {
    const loadPosts = async () => {
      if (page > 1 || posts.length === 0) {
        setLoading(true);
      }

      try {
        const fetchedPosts = await fetchAllPosts(page, limit);

        if (fetchedPosts.length < limit) setHasMore(false);

        const likedSet = new Set<number>();
        const repostedSet = new Set<number>();
        fetchedPosts.forEach((post) => {
          if (post.likedByCurrentUser) likedSet.add(post.id);
          if (post.repostedByCurrentUser) repostedSet.add(post.id);
        });

        setPosts((prev) => [...prev, ...fetchedPosts]);

        setLikedPosts(
          (prev) => new Set([...Array.from(prev), ...Array.from(likedSet)])
        );
        setRepostedPosts(
          (prev) => new Set([...Array.from(prev), ...Array.from(repostedSet)])
        );
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [page]);

  const timeSince = useCallback((dateString: string): string => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 1000
    );
    const intervals = [
      { label: "y", seconds: 31536000 },
      { label: "mo", seconds: 2592000 },
      { label: "d", seconds: 86400 },
      { label: "h", seconds: 3600 },
      { label: "m", seconds: 60 },
      { label: "s", seconds: 1 },
    ];
    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count >= 1) return `${count}${i.label}`;
    }
    return "0s";
  }, []);

  // Like
  const handleLike = async (postId: number) => {
    if (!user) return;
    try {
      const data = await likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likeCount: data.likeCount } : p
        )
      );
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }

        return newSet;
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Repost
  const handleRepost = async (postId: number, comment?: string) => {
    if (!user || repostPending.has(postId)) return;
    setRepostPending((prev) => new Set(prev).add(postId));
    try {
      const data = await repostPost(postId, comment);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, repostCount: data.repostCount } : p
        )
      );
      if (data.reposted) setRepostedPosts((prev) => new Set(prev).add(postId));
      setReposting(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRepostPending((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleRepostFromModal = async (
    postToRepost: PostType,
    thought: string
  ) => {
    await handleRepost(postToRepost.id, thought?.trim() || "");
    setIsModalOpen(null);
  };

  // const handleCommentSubmit = async (postId: number) => {
  //   const text = commentTextMap[postId]?.trim();
  //   if (!text) return;

  //   // Optimistic update
  //   setPosts((prev) =>
  //     prev.map((p) =>
  //       p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
  //     )
  //   );
  //   setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));

  //   try {
  //     const newComment = await commentPost(postId, text);
  //     setCommentsMap((prev) => ({
  //       ...prev,
  //       [postId]: [newComment.comment, ...(prev[postId] || [])],
  //     }));
  //   } catch (err) {
  //     console.error(err);
  //     setPosts((prev) =>
  //       prev.map((p) =>
  //         p.id === postId ? { ...p, commentCount: p.commentCount - 1 } : p
  //       )
  //     );
  //   }
  // };

  // Comments
  const handleCommentChange = (postId: number, text: string) => {
    setCommentTextMap((prev) => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = async (postId: number) => {
    const text = commentTextMap[postId]?.trim();
    if (!text) return;

    setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
      )
    );

    try {
      // Send comment to backend
      const newComment = await commentPost(postId, text);

      const safeComment = {
        ...newComment.comment,
        user: newComment.comment.user || { name: "Unknown", id: 0, email: "" },
      };

      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [safeComment, ...(prev[postId] || [])],
      }));
    } catch (err) {
      console.error(err);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentCount: p.commentCount - 1 } : p
        )
      );
    }
  };

  const handleShowComments = async (postId: number) => {
    if (activeCommentPost === postId) {
      setActiveCommentPost(null);
      return;
    }
    setActiveCommentPost(postId);

    if (!commentsMap[postId]) {
      try {
        const comments = await getPostComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (posts.length === 0 && loading)
    return <p className="text-center p-8">Loading feed...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;
  if (posts.length === 0 && !loading)
    return <p className="text-center p-8 text-gray-500">No posts available.</p>;

  return (
    <>
      <div className="max-w-[42rem] mx-auto space-y-4 px-1 sm:px-0">
        {posts.map((post, index) => {
          const authorName = post.author?.profile?.name || "Unknown";
          const postDate = post.createdAt ? timeSince(post.createdAt) : "";
          const media = post.media || [];
          const isDropdownOpen =
            reposting?.post.id === post.id && reposting.openDropdown;

          // Determine if this is the last post to apply the ref
          const isLastPost = index === posts.length - 1;

          return (
            <div
              key={post.id}
              ref={isLastPost ? lastPostRef : null}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
            >
              {/* Author */}
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

              {/* Stats */}
              <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3 mt-3 relative">
                <span
                  className="cursor-pointer hover:text-blue-600 relative"
                  onClick={() =>
                    setActiveLikesBox(
                      activeLikesBox === post.id ? null : post.id
                    )
                  }
                >
                  <span className="font-semibold">{post.likeCount}</span> Likes
                  {activeLikesBox === post.id && (
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
                  <span className="font-semibold">{post.commentCount}</span>{" "}
                  Comments
                </span>

                <span>
                  <span className="font-semibold">{post.repostCount}</span>{" "}
                  Reposts
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-around text-gray-600 mt-2 border-t border-gray-100 pt-2">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 ${
                    likedPosts.has(post.id) ? "text-blue-600" : "text-gray-600"
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
                        isDropdownOpen ? null : { post, openDropdown: true }
                      )
                    }
                    className={`flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 ${
                      repostedPosts.has(post.id)
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    <AiOutlineRetweet size={20} />
                    <span className="hidden sm:inline">Repost</span>
                  </button>

                  {isDropdownOpen && (
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
              {activeCommentPost === post.id && (
                <div className="mt-4 space-y-3">
                  {/* Comment input */}
                  <div className="flex gap-2 items-start">
                    <MdAccountCircle className="w-10 h-10 text-gray-400 rounded-full flex-shrink-0" />
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center border border-gray-300 rounded-full px-3 py-1">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentTextMap[post.id] || ""}
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
                            setShowEmojiPickerFor(
                              showEmojiPickerFor === post.id ? null : post.id
                            )
                          }
                        />
                      </div>

                      {/* Only show Send button if input is not empty */}
                      {commentTextMap[post.id]?.trim() && (
                        <button
                          className="mt-1 bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700 transition self-end"
                          onClick={() => handleCommentSubmit(post.id)}
                        >
                          Send
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-3 mt-2">
                    {(commentsMap[post.id] || []).map((comment) => (
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

                  {/* Emoji picker */}
                  {showEmojiPickerFor === post.id && (
                    <div className="absolute z-50 bottom-12 left-0">
                      <EmojiPicker
                        onEmojiClick={(emojiData) =>
                          handleCommentChange(
                            post.id,
                            (commentTextMap[post.id] || "") + emojiData.emoji
                          )
                        }
                        width={300}
                        height={350}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* INFINITE SCROLL  */}
        {hasMore && loading && (
          <p className="text-center p-4 text-blue-600">Loading more posts...</p>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center p-4 text-gray-500">End</p>
        )}
      </div>

      {/* Repost Modal */}
      {isModalOpen && (
        <RepostModal
          post={isModalOpen}
          onClose={() => setIsModalOpen(null)}
          onSubmit={handleRepostFromModal}
        />
      )}

      {/* Lightbox  Diolog*/}
      {lightbox && (
        <MediaLightbox
          media={lightbox.media}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
};

export const PostMediaGrid: React.FC<{
  media: MediaItem[];
  onClick?: (index: number) => void;
}> = ({ media, onClick }) => {
  const count = media.length;

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

  const grid =
    count === 1
      ? "grid-cols-1 h-96"
      : count === 2
      ? "grid-cols-2 h-64"
      : "grid-cols-2 grid-rows-2 h-96";

  return (
    <div className={`mb-4 grid ${grid} gap-1`}>
      {media
        .filter((m) => m.type !== "document")
        .slice(0, 4)
        .map((m, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[2px] cursor-pointer"
            onClick={() => onClick?.(i)}
          >
            {m.type === "video" ? (
              <video
                src={m.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={m.url}
                alt={`media-${i}`}
                className="w-full h-full object-cover"
              />
            )}
            {count > 4 && i === 3 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-semibold">
                +{count - 4}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default Feed;
