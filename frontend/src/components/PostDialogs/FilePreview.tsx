import { useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";

interface FilePreviewProps {
  file: File;
  removeFile: () => void;
}

const FilePreview = ({ file }: FilePreviewProps) => {
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const isMedia =
    file.type.startsWith("image") || file.type.startsWith("video");
  const isPDF = file.type === "application/pdf";

  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="relative flex flex-col mt-2 p-3 border border-gray-300 rounded-lg bg-gray-50 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer flex-1"
          onClick={() => isPDF && setShowPdfPreview((prev) => !prev)}
          title={isPDF ? "Click to toggle PDF preview" : undefined}
        >
          {isMedia ? (
            file.type.startsWith("image") ? (
              <img
                src={previewUrl}
                alt="preview"
                className="w-30 h-20 object-cover rounded-md border"
              />
            ) : (
              <video
                src={previewUrl}
                className="w-20 h-20 object-cover rounded-md border"
                controls={false}
              />
            )
          ) : (
            <FaRegFileAlt className="text-gray-400 w-20 h-20 flex-shrink-0" />
          )}

          <div className="flex flex-col truncate">
            <span className="truncate font-medium text-gray-800">
              {file.name}
            </span>
            <span className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
      </div>

      {isPDF && showPdfPreview && (
        <div className="mt-3 border rounded overflow-hidden shadow-inner">
          <iframe
            src={previewUrl}
            title={file.name}
            className="w-full h-[600px]"
          />
        </div>
      )}
    </div>
  );
};

export default FilePreview;