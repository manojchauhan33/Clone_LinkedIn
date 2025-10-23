import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import {
  fetchAllPosts,
  Post as PostType,
  likePost,
  repostPost,
  commentPost,
  getPostComments,
  getPostReposts,
  PostRepostUser,
} from "../../api/Post";

import PostItem, {
  // PostMediaGrid,
  MediaItem,
  RepostingPost,
  PostCommentUser,
} from "./PostItem";

// import {
//   AiOutlineLike,
//   AiOutlineComment,
//   AiOutlineRetweet,
// } from "react-icons/ai";
// import { MdAccountCircle } from "react-icons/md";
// import { FaRegFileAlt } from "react-icons/fa";
// import { IoIosSend } from "react-icons/io";
// import { BiCommentDetail } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
// import { BsEmojiSmile } from "react-icons/bs";

const RepostModal = lazy(() => import("./RepostModal"));
const MediaLightbox = lazy(() => import("./MediaLightbox"));
const RepostDialog = lazy(() => import("./RepostDialog"));

interface CommentFromAPI {
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

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(
    null
  );
  const [commentTextMap, setCommentTextMap] = useState<Record<number, string>>(
    {}
  );
  const [commentsMap, setCommentsMap] = useState<
    Record<number, PostCommentUser[]>
  >({});
  const [reposting, setReposting] = useState<RepostingPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<PostType | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<number>>(new Set());
  const [repostPending, setRepostPending] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<{
    media: MediaItem[];
    index: number;
  } | null>(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<number | null>(
    null
  );
  const [activeLikesBox, setActiveLikesBox] = useState<number | null>(null);
  const [repostModalPost, setRepostModalPost] = useState<PostType | null>(null);
  const [repostList, setRepostList] = useState<PostRepostUser[]>([]);
  const [repostLoading, setRepostLoading] = useState(false);
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

  const handleLike = useCallback(
    async (postId: number) => {
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
    },
    [user]
  );

  const handleRepost = useCallback(
    async (postId: number, comment?: string) => {
      if (!user || repostPending.has(postId)) return;
      setRepostPending((prev) => new Set(prev).add(postId));
      try {
        const data = await repostPost(postId, comment);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, repostCount: data.repostCount } : p
          )
        );
        if (data.reposted)
          setRepostedPosts((prev) => new Set(prev).add(postId));
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
    },
    [user, repostPending]
  );

  const handleRepostFromModal = async (
    postToRepost: PostType,
    thought: string
  ) => {
    await handleRepost(postToRepost.id, thought?.trim() || "");
    setIsModalOpen(null);
  };

  const handleCommentChange = useCallback((postId: number, text: string) => {
    setCommentTextMap((prev) => ({ ...prev, [postId]: text }));
  }, []);

  const handleCommentSubmit = useCallback(
    async (postId: number) => {
      const text = commentTextMap[postId]?.trim();
      if (!text) return;

      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
        )
      );

      try {
        const newComment: { comment: CommentFromAPI } = await commentPost(
          postId,
          text
        );

        const safeComment: PostCommentUser = {
          ...newComment.comment,
          user: newComment.comment.user || {
            id: 0,
            name: "Unknown",
            email: "",
          },
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
    },
    [commentTextMap]
  );

  const handleShowComments = useCallback(
    async (postId: number) => {
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
    },
    [activeCommentPost, commentsMap]
  );

  const handleShowReposts = async (post: PostType) => {
    setRepostModalPost(post);
    setRepostLoading(true);
    try {
      const reposts = await getPostReposts(post.id);
      setRepostList(reposts);
    } catch (err) {
      console.error(err);
      setRepostList([]);
    } finally {
      setRepostLoading(false);
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
        <Suspense fallback={<p>Loading...</p>}>
          {posts.map((post, index) => {
            const isLastPost = index === posts.length - 1;

            
            const isLiked = likedPosts.has(post.id);
            const isReposted = repostedPosts.has(post.id);
            const isCommentSectionOpen = activeCommentPost === post.id;
            const commentText = commentTextMap[post.id] || "";
            const comments = commentsMap[post.id] || [];
            const showEmojiPicker = showEmojiPickerFor === post.id;
            const isRepostDropdownOpen = reposting?.post.id === post.id && reposting.openDropdown;
            

            return (
              <PostItem
                key={post.id}
                post={post}
                isLiked={isLiked}
                isReposted={isReposted}
                isCommentSectionOpen={isCommentSectionOpen}
                commentText={commentText}
                comments={comments}
                showEmojiPicker={showEmojiPicker}
                isRepostDropdownOpen={isRepostDropdownOpen}
                activeLikesBoxId={activeLikesBox}
                timeSince={timeSince}
                handleLike={handleLike}
                handleShowComments={handleShowComments}
                handleCommentChange={handleCommentChange}
                handleCommentSubmit={handleCommentSubmit}
                handleRepost={handleRepost}
                handleShowReposts={handleShowReposts}
                setLightbox={setLightbox}
                setActiveLikesBox={setActiveLikesBox}
                setShowEmojiPickerFor={setShowEmojiPickerFor}
                setReposting={setReposting}
                setIsModalOpen={setIsModalOpen}
                // Infinite Scroll Ref
                isLastPost={isLastPost}
                lastPostRef={lastPostRef}
              />
            );
          })}
        </Suspense>

        {hasMore && loading && (
          <p className="text-center p-4 text-blue-600">Loading more posts...</p>
        )}
      </div>

      <Suspense fallback={null}>
        {/* Repost Modal */}
        {isModalOpen && (
          <RepostModal
            post={isModalOpen}
            onClose={() => setIsModalOpen(null)}
            onSubmit={handleRepostFromModal}
          />
        )}

        
        {lightbox && (
          <MediaLightbox
            media={lightbox.media}
            initialIndex={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}

        {repostModalPost && (
          <RepostDialog
            onClose={() => setRepostModalPost(null)}
            reposts={repostList}
            loading={repostLoading}
          />
        )}
      </Suspense>
    </>
  );
};

export default Feed;