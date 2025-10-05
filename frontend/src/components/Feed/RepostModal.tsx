import React, { useState } from "react";
import { BiX } from "react-icons/bi";
import { Post as PostType } from "../../api/Post";
import { MdAccountCircle } from "react-icons/md";

interface RepostModalProps {
  post: PostType;
  onClose: () => void;
  onSubmit: (post: PostType, thought: string) => void;
}

const RepostModal: React.FC<RepostModalProps> = ({
  post,
  onClose,
  onSubmit,
}) => {
  const [thought, setThought] = useState("");

  const handleSubmit = () => {
    if (thought.trim() === "") {
      alert("Please add your thoughts before reposting.");
      return;
    }
    onSubmit(post, thought);
  };

  const originalAuthorName = post.author?.profile?.name || "Unknown Author";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Share Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <BiX size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3 mb-2">
            <MdAccountCircle className="w-10 h-10 text-gray-500 rounded-full flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">
                {originalAuthorName}
              </p>
              <p className="text-sm text-gray-500">Original Post</p>
            </div>
          </div>
          <textarea
            className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            placeholder="What do you want to talk about?"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            maxLength={1300}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={thought.trim() === ""}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              thought.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-200 text-blue-400 cursor-not-allowed"
            }`}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;
