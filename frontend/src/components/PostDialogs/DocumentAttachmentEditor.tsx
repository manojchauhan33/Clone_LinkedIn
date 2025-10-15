import { useCallback } from "react";
import FilePreview from "./FilePreview";
import { FiTrash, FiPlus } from "react-icons/fi";

interface DocumentAttachmentEditorProps {
  files: File[];
  onClose: () => void;
  onUpdate: (files: File[]) => void;
  onAddMore?: () => void;
}

const DocumentAttachmentEditor = ({
  files,
  onClose,
  onUpdate,
  onAddMore,
}: DocumentAttachmentEditorProps) => {
  const handleRemoveDocument = useCallback(
    (index: number) => onUpdate(files.filter((_, i) => i !== index)),
    [files, onUpdate]
  );

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
        {files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={onAddMore}
              className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition text-lg font-semibold"
            >
              <FiPlus size={20} /> Upload Document
            </button>
          </div>
        ) : (
          files.map((file, idx) => (
            <div key={file.name + idx} className="relative w-full max-w-2xl">
              <FilePreview
                file={file}
                removeFile={() => handleRemoveDocument(idx)}
              />

              <button
                onClick={() => handleRemoveDocument(idx)}
                className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 rounded-full hover:bg-red-100 shadow-md transition"
                title="Remove Document"
              >
                <FiTrash size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default DocumentAttachmentEditor;
