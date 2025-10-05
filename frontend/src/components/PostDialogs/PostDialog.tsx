import React, { useState, useRef, useEffect } from "react";
import {FaRegFileAlt,FaRegCalendarAlt,FaRegImages,FaTimes,} from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import { MdOutlineEdit, MdAccountCircle } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { createPost } from "../../api/Post";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import MediaAttachmentEditor from "./MediaAttachmentEditor";
import DocumentAttachmentEditor from "./DocumentAttachmentEditor";
import FilePreview from "./FilePreview";
import PostSettingsDialog from "./PostSettingsDialog";

type AttachmentType = "media" | "event" | "document" | null;
type DialogStep = "compose" | "media_editor" | "document_editor";

interface DialogProps {
  close: () => void;
  initialFiles?: File[];
}

const PostDialog = ({ close, initialFiles = [] }: DialogProps) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [postHashtags, setPostHashtags] = useState<string | null>(null);
  const [dialogStep, setDialogStep] = useState<DialogStep>("compose");
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [postVisibility, setPostVisibility] = useState<"public" | "connection-only">("public");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (initialFiles.length > 0) {
      const mediaFiles = initialFiles.filter(
        (f) => f.type.startsWith("image") || f.type.startsWith("video")
      );
      const documents = initialFiles.filter(
        (f) => !f.type.startsWith("image") && !f.type.startsWith("video")
      );
      setSelectedMediaFiles(mediaFiles);
      setSelectedDocuments(documents.slice(0, 1));
      setDialogStep(
        mediaFiles.length > 0
          ? "media_editor"
          : documents.length > 0
          ? "document_editor"
          : "compose"
      );
    }
  }, [initialFiles]);

  useEffect(() => {
    const hashtagRegex = /(^|\s)#([A-Za-z0-9_]+)/g;
    const matches: string[] = [];
    let match;
    while ((match = hashtagRegex.exec(postContent)) !== null) {
      matches.push(match[2]);
    }
    setPostHashtags(matches.length > 0 ? matches.join(",") : null);
  }, [postContent]);

  const triggerFileInput = (
    accept: string,
    type: "media" | "document",
    allowMultiple = false
  ) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.setAttribute("accept", accept);
    fileInputRef.current.multiple = allowMultiple;
    fileInputRef.current.onchange = (e) =>
      handleFileChange(
        e as unknown as React.ChangeEvent<HTMLInputElement>,
        type
      );
    fileInputRef.current.click();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "media" | "document"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const filesArray = Array.from(e.target.files);
    const MAX_SIZE_MB = 100;
    const oversized = filesArray.find(
      (f) => f.size > MAX_SIZE_MB * 1024 * 1024
    );
    if (oversized) {
      setError(
        `File "${oversized.name}" is too large. Max is ${MAX_SIZE_MB} MB`
      );
      return;
    }
    if (type === "media") {
      setSelectedMediaFiles([...selectedMediaFiles, ...filesArray]);
      setDialogStep("media_editor");
    } else {
      setSelectedDocuments([filesArray[0]]);
      setDialogStep("document_editor");
    }
    setError(null);
  };

  const removeMediaFile = (index: number) =>
    setSelectedMediaFiles(selectedMediaFiles.filter((_, i) => i !== index));
  const removeDocument = (index: number) =>
    setSelectedDocuments(selectedDocuments.filter((_, i) => i !== index));

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    if (!textareaRef.current) {
      setPostContent((prev) => prev + emoji);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setPostContent(
      postContent.slice(0, start) + emoji + postContent.slice(end)
    );
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      const content = postContent.trim() || null;
      const allFiles = [...selectedMediaFiles, ...selectedDocuments];
      await createPost(
        { content, hashtags: postHashtags, postType: postVisibility },
        allFiles
      );
      close();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const attachmentOptions = [
    {
      icon: <FaRegImages className="w-6 h-6 text-blue-500" />,
      label: "Media",
      onClick: () => triggerFileInput("image/*,video/*", "media", true),
      type: "media" as AttachmentType,
    },
    {
      icon: <FaRegCalendarAlt className="w-6 h-6 text-red-500" />,
      label: "Event",
      onClick: () =>{ 
        console.log("Not implemented")        //no idea about it i will build it before 
      },
      type: "event" as AttachmentType,
    },
    {
      icon: <FaRegFileAlt className="w-6 h-6 text-purple-500" />,
      label: "Document",
      onClick: () =>
        triggerFileInput(
          "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "document"
        ),
      type: "document" as AttachmentType,
    },
  ];

  const isPostDisabled =
    isSubmitting ||
    (!postContent.trim() &&
      selectedMediaFiles.length === 0 &&
      selectedDocuments.length === 0);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative flex flex-col max-h-[90vh] min-h-[600px]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {dialogStep === "compose"
              ? "Create a post"
              : dialogStep === "media_editor"
              ? "Edit Media"
              : "Edit Document"}
          </h2>

          <button
            type="button"
            onClick={close}
            aria-label="Close post dialog"
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full text-2xl"
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        {dialogStep === "compose" && (
          <div
            className="p-4 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg transition"
            onClick={() => setShowSettingsDialog(true)}
          >
            <MdAccountCircle className="w-12 h-12 text-gray-400" />
            <div className="flex flex-col items-start">
              <h3 className="font-semibold text-gray-800 text-base">
                {user?.email}
              </h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full mt-0.5">
                {postVisibility === "public"
                  ? "Post to Anyone"
                  : "Post to Connections"}
              </span>
            </div>
          </div>
        )}

        
        <div className="px-4 flex-1 overflow-y-auto relative py-2">
          {dialogStep === "compose" && (
            <>
              <textarea
                ref={textareaRef}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What do you want to talk about?"
                className="w-full text-lg p-2 border border-gray-200 rounded resize-none focus:outline-none min-h-[300px]"
                disabled={isSubmitting}
              />

              <div className="flex flex-col space-y-4 mt-4">
                {selectedMediaFiles.map((file, idx) => {
                  const isVideo = file.type.startsWith("video");
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border border-gray-300"
                    >
                      {isVideo ? (
                        <video
                          src={previewUrl}
                          controls
                          className="w-full h-auto rounded-lg object-cover"
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt={`Preview ${idx}`}
                          className="w-full h-auto rounded-lg object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMediaFile(idx)}
                        aria-label="Remove media file"
                        className="absolute top-1 right-2 text-red-500 p-2 rounded-full shadow-md"
                      >
                        <FaTimes size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDialogStep("media_editor")}
                        aria-label="Edit media file"
                        className="absolute top-1 right-16 text-black py-2 rounded-full"
                      >
                        <MdOutlineEdit size={25} />
                      </button>
                    </div>
                  );
                })}

                {selectedDocuments.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative border border-gray-300 rounded-lg bg-gray-50 p-4 flex items-start"
                  >
                    <div className="flex-1">
                      <FilePreview
                        file={file}
                        removeFile={() => removeDocument(idx)}
                      />
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        type="button"
                        onClick={() => setDialogStep("document_editor")}
                        aria-label="Edit document"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-black"
                      >
                        <MdOutlineEdit size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        aria-label="Remove document"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* {dialogStep === "media_editor" && selectedMediaFiles.length > 0 && (
            <MediaAttachmentEditor
              files={selectedMediaFiles}
              onClose={() => setDialogStep("compose")}
              onUpdate={setSelectedMediaFiles}
              onAddMore={() =>
                triggerFileInput("image/*,video/*", "media", true)
              }
            />
          )} */}

          {dialogStep === "media_editor" && (
            <MediaAttachmentEditor
              files={selectedMediaFiles}
              onClose={() => setDialogStep("compose")}
              onUpdate={setSelectedMediaFiles}
              onAddMore={() =>
                triggerFileInput("image/*,video/*", "media", true)
              }
            />
          )}

          {dialogStep === "document_editor" && selectedDocuments.length > 0 && (
            <DocumentAttachmentEditor
              files={selectedDocuments}
              onClose={() => setDialogStep("compose")}
              onUpdate={setSelectedDocuments}
              onAddMore={() =>
                triggerFileInput(
                  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  "document"
                )
              }
            />
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {/* <input type="file" ref={fileInputRef} className="hidden" /> */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            aria-label="Attach media or document files"
            title="Attach media or document files"
          />
        </div>

        {dialogStep === "compose" && (
          <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-2 items-center">
              {attachmentOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={opt.onClick}
                  className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                >
                  {opt.icon}
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {opt.label}
                  </span>
                </button>
              ))}
              <button
                type="button"
                ref={emojiButtonRef}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                aria-label="Toggle emoji picker"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
              >
                <BsEmojiSmile size={26} />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 sm:left-auto sm:right-0 z-10">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isPostDisabled}
              className={`px-6 py-2 rounded-full font-semibold text-base shadow-md ${
                isPostDisabled
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        )}
      </div>

      {showSettingsDialog && (
        <PostSettingsDialog
          close={() => setShowSettingsDialog(false)}
          currentVisibility={postVisibility}
          onUpdate={setPostVisibility}
        />
      )}
    </div>
  );
};

export default PostDialog;
