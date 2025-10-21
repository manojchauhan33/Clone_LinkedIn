import React from "react";
import { MdAccountCircle } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";
import { RepostWithUser } from "../../api/Post";
// import { PostRepostUser } from "../../api/Post";

interface MediaItem {
  url: string;
  type: "image" | "video" | "document";
}

interface RepostDialogProps {
  onClose: () => void;
  reposts: RepostWithUser[];
  loading: boolean;
}

// interface RepostDialogProps {
//   onClose: () => void;
//   reposts: PostRepostUser[];
//   loading: boolean;
// }

const RepostDialog: React.FC<RepostDialogProps> = ({
  onClose,
  reposts,
  loading,
}) => {
  const renderMedia = (media: MediaItem[]) => {
    if (!media || media.length === 0) return null;

    if (media.length === 1) {
      const m = media[0];
      return (
        <div className="mt-2 w-full h-[400px] rounded overflow-hidden">
          {m.type === "video" ? (
            <video
              src={m.url}
              controls
              className="w-full h-full object-contain rounded bg-black"
            />
          ) : m.type === "image" ? (
            <img
              src={m.url}
              alt={`media-0`}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <a
              title="document"
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 border border-gray-300 rounded mt-1"
            >
              <FaRegFileAlt className="text-blue-600 text-xl" />
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {media.map((m, idx) => (
          <div key={idx} className="rounded overflow-hidden h-64 w-full">
            {m.type === "video" ? (
              <video
                src={m.url}
                controls
                className="w-full h-full object-cover rounded bg-black"
              />
            ) : m.type === "image" ? (
              <img
                src={m.url}
                alt={`media-${idx}`}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <a
                title="documet"
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 border border-gray-300 rounded mt-1"
              >
                <FaRegFileAlt className="text-blue-600 text-xl" />
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[1000] overflow-auto py-8">
      <div className="bg-white rounded w-[90%] max-w-3xl max-h-[90vh] flex flex-col relative">

        
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">
            {reposts.length} repost{reposts.length !== 1 ? "s" : ""}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 font-bold text-lg"
          >
            X
          </button>
        </div>

        
        <div className="overflow-auto p-6 flex-1 scroll-smooth">
          {loading ? (
            <p className="text-center py-16 text-gray-500 text-lg">
              Loading reposts...
            </p>
          ) : reposts.length === 0 ? (
            <p className="text-center py-16 text-gray-500 text-lg">
              No reposts yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {reposts.map((r) => (
                <li
                  key={r.repostId}
                  className="border border-gray-200 rounded-lg shadow-sm p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <MdAccountCircle className="w-10 h-10 text-gray-400 rounded-full" />
                      <p className="text-sm font-semibold text-gray-700">
                        {r.user.name} reposted
                      </p>
                      {r.repostComment && (
                        <p className="text-gray-600 text-sm ml-2">
                          {r.repostComment}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <MdAccountCircle className="w-8 h-8 text-gray-400 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {r.originalPost.author.name}
                        </p>
                        {r.originalPost.content && (
                          <p className="text-gray-800 mt-1 text-sm whitespace-pre-wrap break-words">
                            {r.originalPost.content}
                          </p>
                        )}
                        {r.originalPost.media &&
                          r.originalPost.media.length > 0 &&
                          renderMedia(r.originalPost.media)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepostDialog;