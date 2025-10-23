import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  // Suspense,
} from "react";
import {
  FaRegFileAlt,
  FaRegCalendarAlt,
  FaPoll,
  FaTimes,
} from "react-icons/fa";
// import { BsEmojiSmile } from "react-icons/bs";
import { MdOutlineEdit, MdAccountCircle } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { createPost } from "../../api/Post";
import MediaAttachmentEditor from "./MediaAttachmentEditor";
import DocumentAttachmentEditor from "./DocumentAttachmentEditor";
import FilePreview from "./FilePreview";
import PostSettingsDialog from "./PostSettingsDialog";
import PostTextarea from "./PostTextarea";
import { BsImage } from "react-icons/bs";
import PostEmojiPicker from "./PostEmojiPicker";

// const EmojiPicker = React.lazy(() => import("emoji-picker-react"));

type DialogStep = "compose" | "media_editor" | "document_editor";

interface DialogProps {
  close: () => void;
  initialFiles?: File[];
}

interface MediaFileWithPreview {
  file: File;
  previewUrl: string;
}

const PostDialog = ({ close, initialFiles = [] }: DialogProps) => {
  const { user } = useAuth();
  const email = user?.email;
  // console.log("render");

  // const [hashtags, setHashtags] = useState<string[]>([]);
  const [step, setStep] = useState<DialogStep>("compose");
  const [mediaFiles, setMediaFiles] = useState<MediaFileWithPreview[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "connection-only">(
    "public"
  );

  const [tempMediaFiles, setTempMediaFiles] = useState<MediaFileWithPreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hashtagsRef = useRef<string[]>([]);

  const handleInitialFiles = useCallback((files: File[]) => {
    const media = files
      .filter((f) => f.type.startsWith("image") || f.type.startsWith("video"))
      .map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    const docs = files.filter(
      (f) => !f.type.startsWith("image") && !f.type.startsWith("video")
    );
    setMediaFiles(media);
    setDocuments(docs);
    setStep(
      media.length
        ? "media_editor"
        : docs.length
        ? "document_editor"
        : "compose"
    );
  }, []);

  useEffect(() => {
    if (initialFiles.length > 0) handleInitialFiles(initialFiles);
  }, [initialFiles, handleInitialFiles]);

  // useEffect(() => {
  //   return () => mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
  // }, []);
  //mediaFiles

  const mediaFilesRef = useRef<MediaFileWithPreview[]>([]);

// Keep the ref updated whenever mediaFiles changes
useEffect(() => {
  mediaFilesRef.current = mediaFiles;
}, [mediaFiles]);

// Cleanup URLs only once on unmount
useEffect(() => {
  return () => {
    mediaFilesRef.current.forEach((m) => URL.revokeObjectURL(m.previewUrl));
  };
}, []);



  // const extractHashtags = useCallback(() => {
  //   const content = textareaRef.current?.value || "";
  //   const matches = Array.from(
  //     new Set(content.match(/#[\w]+/g)?.map((tag) => tag.toLowerCase()))
  //   );
  //   setHashtags(matches || []);
  // }, []);

  const extractHashtags = useCallback(() => {
    const content = textareaRef.current?.value || "";
    const matches = Array.from(
      new Set(content.match(/#[\w]+/g)?.map((tag) => tag.toLowerCase()))
    );
    hashtagsRef.current = matches || [];
  }, []);

  // const handleFileChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>, type: "media" | "document") => {
  //     const files = Array.from(e.target.files || []);
  //     if (!files.length) return;

  //     const MAX_SIZE_MB = 100;
  //     const tooLarge = files.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
  //     if (tooLarge)
  //       return setError(`File "${tooLarge.name}" exceeds ${MAX_SIZE_MB} MB.`);

  //     if (type === "media") {
  //       const newMedia = files.map((f) => ({
  //         file: f,
  //         previewUrl: URL.createObjectURL(f),
  //       }));
  //       setMediaFiles((prev) => [...prev, ...newMedia]);
  //       setStep("media_editor");
  //     } else {
  //       setDocuments([files[0]]);
  //       setStep("document_editor");
  //     }

  //     setError(null);
  //   },
  //   []
  // );

  const handleFileChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>, type: "media" | "document") => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const MAX_SIZE_MB = 100;
    const tooLarge = files.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooLarge)
      return setError(`File "${tooLarge.name}" exceeds ${MAX_SIZE_MB} MB.`);

    // if (type === "media") {
    //   const newMedia = files.map((f) => ({
    //     file: f,
    //     previewUrl: URL.createObjectURL(f),
    //   }));
    //   setTempMediaFiles(newMedia);
    //   setStep("media_editor");
    // } 
    
    if (type === "media") {
      const newMedia = files.map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
      }));
      setTempMediaFiles((prev) => [...prev, ...newMedia]); // append new media
      setStep("media_editor");
    }


    else {
      setDocuments([files[0]]);
      setStep("document_editor");
    }

    setError(null);
  },
  []
);


  const triggerFilePicker = useCallback(
    (accept: string, type: "media" | "document", multiple = false) => {
      if (!fileInputRef.current) return;
      fileInputRef.current.value = "";
      fileInputRef.current.accept = accept;
      fileInputRef.current.multiple = multiple;
      fileInputRef.current.onchange = (e) =>
        handleFileChange(
          e as unknown as React.ChangeEvent<HTMLInputElement>,
          type
        );
      fileInputRef.current.click();
    },
    [handleFileChange]
  );

  const removeAllMedia = useCallback(() => {
    mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setMediaFiles([]);
  }, [mediaFiles]);

  const removeDocument = useCallback(
    (index: number) =>
      setDocuments((prev) => prev.filter((_, i) => i !== index)),
    []
  );

  // const addEmoji = useCallback(
  //   (emoji: string) => {
  //     const textarea = textareaRef.current;
  //     if (!textarea) return;
  //     const start = textarea.selectionStart;
  //     const end = textarea.selectionEnd;
  //     textarea.value =
  //       textarea.value.slice(0, start) + emoji + textarea.value.slice(end);
  //     textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
  //     textarea.focus();
  //     extractHashtags();
  //   },
  //   [extractHashtags]

  // );

  // const handleEmojiClick = useCallback(
  //   (emojiData: { emoji: string }) => {
  //     addEmoji(emojiData.emoji);
  //   },
  //   [addEmoji]
  // );

  // const emojiPickerElement = useMemo(() => {
  //   if (!showEmojiPicker) return null;

  //   return (
  //     <div className="absolute bottom-16 right-4 z-10">
  //       {/* <Suspense fallback={<div>Loading emojis...</div>}> */}
  //       <EmojiPicker onEmojiClick={handleEmojiClick} />
  //       {/* </Suspense> */}
  //     </div>
  //   );
  // }, [showEmojiPicker, handleEmojiClick]);

  // const handleSubmit = useCallback(async () => {
  //   const content = textareaRef.current?.value || "";
  //   extractHashtags();

  //   if (!content.trim() && mediaFiles.length === 0 && documents.length === 0)
  //     return;

  //   try {
  //     setIsPosting(true);
  //     setError(null);
  //     const allFiles = [...mediaFiles.map((m) => m.file), ...documents];
  //     await createPost(
  //       {
  //         content: content.trim() || null,
  //         hashtags: hashtags.join(","),
  //         postType: visibility,
  //       },
  //       allFiles
  //     );
  //     close();
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to create post");
  //   } finally {
  //     setIsPosting(false);
  //   }
  // }, [mediaFiles, documents, hashtags, visibility, close, extractHashtags]);

  const handleSubmit = async () => {
    extractHashtags();
    const hashtags = hashtagsRef.current; // use them here
    const content = textareaRef.current?.value || "";

    if (!content.trim() && mediaFiles.length === 0 && documents.length === 0)
      return;

    setIsPosting(true);
    try {
      await createPost(
        {
          content: content.trim() || null,
          hashtags: hashtags.join(","),
          postType: visibility,
        },
        [...mediaFiles.map((m) => m.file), ...documents]
      );
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const attachments = useMemo(
    () => [
      {
        icon: <BsImage className="w-6 h-6 text-gray-400" />,
        label: "Media",
        onClick: () => triggerFilePicker("image/*,video/*", "media", true),
      },
      {
        icon: <FaRegFileAlt className="w-6 h-6 text-gray-400" />,
        label: "Document",
        onClick: () =>
          triggerFilePicker(
            "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "document"
          ),
      },
      {
        icon: <FaRegCalendarAlt className="w-6 h-6 text-gray-400" />,
        label: "Event",
        // onClick: () => alert("Event posting not implemented yet."),
      },
      {
        icon: <FaPoll className="w-6 h-6 text-gray-400" />,
        label: "Poll",
        // onClick: () => alert("Event posting not implemented yet."),
      },
    ],
    [triggerFilePicker]
  );

  const isDisabled =
    isPosting ||
    (mediaFiles.length === 0 &&
      documents.length === 0 &&
      !textareaRef.current?.value.trim());

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-white w-full max-w-3xl rounded relative flex flex-col h-[650px] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {step === "compose"
              ? "Create a Post"
              : step === "media_editor"
              ? "Edit Media"
              : "Edit Document"}
          </h2>
          <button
            aria-label="close"
            onClick={close}
            className="text-black p-2 rounded-full text-xl"
            disabled={isPosting}
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
          {step === "compose" && (
            <>
              <div
                className="flex items-center gap-2 mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                onClick={() => setShowSettings(true)}
              >
                <MdAccountCircle className="w-12 h-12 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-800">{email}</h3>
                  <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded-full">
                    {visibility === "public"
                      ? "Post to Anyone"
                      : "Connections only"}
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <PostTextarea ref={textareaRef} disabled={isPosting} />
              {mediaFiles.length > 0 && (
                <div className="absolute top-[10.25rem] right-2 flex gap-2">
                  <button
                    aria-label="editor"
                    onClick={() => setStep("media_editor")}
                    className="bg-black text-white p-1 rounded-full"
                  >
                    <MdOutlineEdit size={20} />
                  </button>
                  <button
                    aria-label="remove-all"
                    onClick={removeAllMedia}
                    className="bg-black text-white p-1 rounded-full"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              )}

              <div className="mt-4 grid gap-2">
                {mediaFiles.length === 1 && (
                  <div className="relative">
                    {mediaFiles[0].file.type.startsWith("video") ? (
                      <video
                        src={mediaFiles[0].previewUrl}
                        controls
                        className="w-full max-h-[400px] object-cover rounded"
                      />
                    ) : (
                      <img
                        src={mediaFiles[0].previewUrl}
                        className="w-full max-h-[400px] object-cover rounded"
                        alt=""
                      />
                    )}
                  </div>
                )}

                {mediaFiles.length === 2 && (
                  <div className="grid grid-cols-2 gap-0.5">
                    {mediaFiles.map((m, idx) =>
                      m.file.type.startsWith("video") ? (
                        <video
                          key={idx}
                          src={m.previewUrl}
                          controls
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <img
                          key={idx}
                          src={m.previewUrl}
                          className="w-full h-48 object-cover rounded"
                          alt=""
                        />
                      )
                    )}
                  </div>
                )}

                {mediaFiles.length > 2 && mediaFiles.length <= 4 && (
                  <div className="grid gap-0.5">
                    <div className="relative">
                      {mediaFiles[0].file.type.startsWith("video") ? (
                        <video
                          src={mediaFiles[0].previewUrl}
                          controls
                          className="w-full max-h-[400px] object-cover rounded"
                        />
                      ) : (
                        <img
                          src={mediaFiles[0].previewUrl}
                          className="w-full max-h-[400px] object-cover rounded"
                          alt=""
                        />
                      )}
                    </div>
                    <div
                      className={`grid grid-cols-${
                        mediaFiles.length - 1
                      } gap-0.5 mt-1`}
                    >
                      {mediaFiles
                        .slice(1)
                        .map((m, idx) =>
                          m.file.type.startsWith("video") ? (
                            <video
                              key={idx + 1}
                              src={m.previewUrl}
                              controls
                              className="w-full h-48 object-cover rounded"
                            />
                          ) : (
                            <img
                              key={idx + 1}
                              src={m.previewUrl}
                              className="w-full h-48 object-cover rounded"
                              alt=""
                            />
                          )
                        )}
                    </div>
                  </div>
                )}

                {mediaFiles.length > 4 && (
                  <div className="grid gap-0.5">
                    <div className="relative">
                      {mediaFiles[0].file.type.startsWith("video") ? (
                        <video
                          src={mediaFiles[0].previewUrl}
                          controls
                          className="w-full max-h-[400px] object-cover rounded"
                        />
                      ) : (
                        <img
                          src={mediaFiles[0].previewUrl}
                          className="w-full max-h-[400px] object-cover rounded"
                          alt=""
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-0.5 mt-1 relative">
                      {mediaFiles
                        .slice(1, 4)
                        .map((m, idx) =>
                          m.file.type.startsWith("video") ? (
                            <video
                              key={idx + 1}
                              src={m.previewUrl}
                              controls
                              className="w-full h-48 object-cover rounded"
                            />
                          ) : (
                            <img
                              key={idx + 1}
                              src={m.previewUrl}
                              className="w-full h-48 object-cover rounded"
                              alt=""
                            />
                          )
                        )}
                      {mediaFiles.length > 4 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-2xl font-bold rounded">
                          +{mediaFiles.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {documents.map((file, idx) => (
                  <FilePreview
                    key={idx}
                    file={file}
                    removeFile={() => removeDocument(idx)}
                  />
                ))}
              </div>
            </>
          )}

          {/* {step === "media_editor" && (
            <MediaAttachmentEditor
              files={mediaFiles.map((m) => m.file)}
              onClose={() => setStep("compose")}
              onUpdate={(updatedFiles) => {
                mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
                const newMedia = updatedFiles.map((f) => ({
                  file: f,
                  previewUrl: URL.createObjectURL(f),
                }));
                setMediaFiles(newMedia);
                // setStep("compose");
              }}
              onAddMore={() =>
                triggerFilePicker("image/*,video/*", "media", true)
              }
            />
          )} */}

          {step === "media_editor" && (
          <MediaAttachmentEditor
          files={tempMediaFiles.map((m) => m.file)}
          onClose={() => setStep("compose")}
          onUpdate={(updatedFiles) => {
            const newMedia = updatedFiles.map((f) => ({
              file: f,
              previewUrl: URL.createObjectURL(f),
            }));
            setTempMediaFiles(newMedia);
          }}
          onNext={() => {
            setMediaFiles(tempMediaFiles); 
            setStep("compose");
          }}
          onAddMore={() =>
            triggerFilePicker("image/*,video/*", "media", true)
          }
        />
        )}


          {step === "document_editor" && (
            <DocumentAttachmentEditor
              files={documents}
              onClose={() => setStep("compose")}
              onUpdate={setDocuments}
              onAddMore={() =>
                triggerFilePicker(
                  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  "document"
                )
              }
            />
          )}

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <input ref={fileInputRef} type="file" hidden />
        </div>

        {step === "compose" && (
          <div className="p-4 border-t flex flex-wrap justify-between items-center gap-2">
            <div className="flex space-x-2">
              {attachments.map((a, i) => (
                <button
                  key={i}
                  onClick={a.onClick}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
                >
                  {a.icon}
                  <span className="hidden sm:inline text-sm">{a.label}</span>
                </button>
              ))}
              {/* <button
                type="button"
                aria-label="emoji picker"
                onClick={() => setShowEmojiPicker((p) => !p)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <BsEmojiSmile size={24} />
              </button> */}

              {/* {showEmojiPicker && (
                <div className="absolute bottom-16 right-4 z-10">
                    <EmojiPicker onEmojiClick={(e) => addEmoji(e.emoji)} />
                </div>
              )} */}

              {/* {emojiPickerElement} */}

              <PostEmojiPicker textareaRef={textareaRef} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`px-6 py-2 rounded-full font-semibold ${
                isDisabled
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <PostSettingsDialog
          close={() => setShowSettings(false)}
          currentVisibility={visibility}
          onUpdate={setVisibility}
        />
      )}
    </div>
  );
};

export default PostDialog;