import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAllPosts,
  Post as PostType,
  likePost,
  repostPost,
  commentPost,
} from "../../api/Post";

import {
  AiOutlineLike,
  AiOutlineComment,
  AiOutlineRetweet,
} from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";
import RepostModal from "./RepostModal";

interface RepostingPost {
  post: PostType;
  openDropdown: boolean;
}

interface MediaItem {
  type: "image" | "video" | "document";
  url: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(
    null
  );
  const [commentTextMap, setCommentTextMap] = useState<Record<number, string>>(
    {}
  );
  const [reposting, setReposting] = useState<RepostingPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<PostType | null>(null);

  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchAllPosts();

        const likedSet = new Set<number>();
        const repostedSet = new Set<number>();
        fetchedPosts.forEach((post) => {
          if (post.likedByCurrentUser) likedSet.add(post.id);
          if (post.repostedByCurrentUser) repostedSet.add(post.id);
        });

        setPosts(fetchedPosts);
        setLikedPosts(likedSet);
        setRepostedPosts(repostedSet);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  //Helper
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

  /*Handlers*/
  const handleLike = async (postId: number) => {
    try {
      const data = await likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likeCount: data.likeCount } : p
        )
      );
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        data.liked ? newSet.add(postId) : newSet.delete(postId);
        return newSet;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepost = async (postId: number) => {
    try {
      const data = await repostPost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, repostCount: data.repostCount } : p
        )
      );
      setRepostedPosts((prev) => {
        const newSet = new Set(prev);
        if (data.reposted) newSet.add(postId);
        else newSet.delete(postId);
        return newSet;
      });
      setReposting(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepostFromModal = async (
    postToRepost: PostType,
    thought: string
  ) => {
    try {
      const data = await repostPost(postToRepost.id, thought.trim());

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postToRepost.id ? { ...p, repostCount: data.repostCount } : p
        )
      );
      setRepostedPosts((prev) => new Set(prev).add(postToRepost.id));

      // add new repost-with-thought post to feed
      const newRepost: PostType = {
        id: Date.now(),
        content: thought,
        media: null,
        likeCount: 0,
        commentCount: 0,
        repostCount: 0,
        createdAt: new Date().toISOString(),
        author: { ...postToRepost.author },
        originalPost: postToRepost,
        likedByCurrentUser: false,
        repostedByCurrentUser: true,
      };
      setPosts((prev) => [newRepost, ...prev]);

      setIsModalOpen(null);
    } catch (err: any) {
      console.error("Repost error:", err);

      // only show alert if it's not just a validation warning
      // if (err.message && err.message !== "Validation error") {
      //   alert("Failed to repost with thought.");
      // }
    }
  };

  const handleCommentChange = (postId: number, text: string) => {
    setCommentTextMap((prev) => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = async (postId: number) => {
    const text = commentTextMap[postId]?.trim();
    if (!text) return;
    try {
      const data = await commentPost(postId, text);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentCount: data.commentCount } : p
        )
      );
      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      setActiveCommentPost(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center p-8">Loading feed...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;
  if (posts.length === 0)
    return <p className="text-center p-8 text-gray-500">No posts available.</p>;

  return (
    <>
      <div className="max-w-[42rem] mx-auto space-y-1 px-1 sm:px-0">
        {posts.map((post) => {
          const authorName = post.author?.profile?.name || "Unknown";
          const postDate = post.createdAt ? timeSince(post.createdAt) : "";
          const media = post.media || [];
          const isDropdownOpen =
            reposting?.post.id === post.id && reposting.openDropdown;

          return (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-2"
            >
              <div className="flex items-start gap-3 mb-3">
                <MdAccountCircle className="w-10 h-10 text-gray-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">{authorName}</p>
                  <p className="text-sm text-gray-500">{postDate} ago</p>
                </div>
              </div>

              {post.content && (
                <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed mb-4 text-base">
                  {post.content}
                </div>
              )}

              {/* Media */}
              {media.length > 0 && <PostMediaGrid media={media} />}

              <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3 mt-3">
                <span>
                  <span className="font-semibold">{post.likeCount}</span> Likes
                </span>
                <span>
                  <span className="font-semibold">{post.commentCount}</span>{" "}
                  Comments
                </span>
                <span>
                  <span className="font-semibold">{post.repostCount}</span>{" "}
                  Reposts
                </span>
              </div>

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
                  onClick={() =>
                    setActiveCommentPost(
                      activeCommentPost === post.id ? null : post.id
                    )
                  }
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
              </div>

              {activeCommentPost === post.id && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="Write a comment..."
                    value={commentTextMap[post.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(post.id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCommentSubmit(post.id);
                    }}
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    onClick={() => handleCommentSubmit(post.id)}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Repost Modal */}
      {isModalOpen && (
        <RepostModal
          post={isModalOpen}
          onClose={() => setIsModalOpen(null)}
          onSubmit={handleRepostFromModal}
        />
      )}
    </>
  );
};

const PostMediaGrid: React.FC<{ media: MediaItem[] }> = ({ media }) => {
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
    <div className={`mb-4 grid ${grid} gap-0.3`}>
      {media
        .filter((m) => m.type !== "document")
        .slice(0, 4)
        .map((m, i) => (
          <div key={i} className="relative overflow-hidden rounded-[2px]">
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
