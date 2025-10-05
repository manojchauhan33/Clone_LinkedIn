import { useState, useMemo, useEffect } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";

interface MediaAttachmentEditorProps {
  files: File[];
  onClose: () => void;
  onUpdate: (files: File[]) => void;
  onAddMore: () => void;
}

const MediaAttachmentEditor = ({
  files,
  onClose,
  onUpdate,
  onAddMore,
}: MediaAttachmentEditorProps) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const currentFile = files[currentFileIndex];

  useEffect(() => {
    if (currentFileIndex >= files.length && files.length > 0) {
      setCurrentFileIndex(files.length - 1);
    }
  }, [files, currentFileIndex]);

  const previewUrl = useMemo(
    () => (currentFile ? URL.createObjectURL(currentFile) : null),
    [currentFile]
  );

  const isImage = currentFile?.type.startsWith("image");
  const isVideo = currentFile?.type.startsWith("video");

  const handleRemove = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onUpdate(updatedFiles);
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <button
          onClick={onAddMore}
          className="flex items-center gap-2 px-8 py-4 bg-[#0A66C2] text-white font-semibold rounded-full hover:bg-[#004182] transition"
        >
          <FaPlus size={20} />
          <span>Upload Media</span>
        </button>
      </div>
    );
  }

  if (!currentFile || !previewUrl) return null;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        <div className="flex-1 bg-black rounded-lg flex items-center justify-center relative min-h-[280px] max-h-[60vh]">
          {isImage ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : isVideo ? (
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : null}
        </div>

        <div className="w-36 flex flex-col gap-3 overflow-y-auto">
          {files.map((file, index) => {
            const thumbUrl = URL.createObjectURL(file);
            return (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden border transition ${
                  index === currentFileIndex
                    ? "border-2 border-[#0A66C2] shadow-lg"
                    : "border border-gray-300 hover:shadow-md"
                }`}
                onClick={() => setCurrentFileIndex(index)}
                title={file.name}
              >
                <img
                  src={thumbUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-36 h-36 object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-700 transition"
                  title="Remove"
                >
                  <FaTrashAlt size={12} />
                </button>
              </div>
            );
          })}

          <button
            onClick={onAddMore}
            aria-label="add more"
            className="w-36 h-36 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500 hover:border-[#0A66C2] hover:text-[#0A66C2] transition"
          >
            <FaPlus size={28} />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 p-4 border-t border-gray-400 rounded-b-lg">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default MediaAttachmentEditor;
