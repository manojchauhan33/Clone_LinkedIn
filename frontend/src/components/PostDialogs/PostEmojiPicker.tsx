import React, { useState, useCallback } from "react";
import { BsEmojiSmile } from "react-icons/bs";
const EmojiPicker = React.lazy(() => import("emoji-picker-react"));

// type Props = {
//   textareaRef: React.RefObject<HTMLTextAreaElement>;
// };

type Props = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
};


const PostEmojiPicker = ({ textareaRef }: Props) => {
  // console.log("+");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = useCallback(
    (emojiData: { emoji: string }) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value =
        textarea.value.slice(0, start) +
        emojiData.emoji +
        textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd =
        start + emojiData.emoji.length;
      textarea.focus();
    },
    [textareaRef]
  );

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="emoji picker"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="p-2 text-gray-500 hover:text-gray-700"
      >
        <BsEmojiSmile size={24} />
      </button>

      {showEmojiPicker && (
        <div className="absolute bottom-full -left-3.5 mb-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default PostEmojiPicker;
