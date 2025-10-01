import FilePreview from "./FilePreview";

interface DocumentAttachmentEditorProps {
  files: File[];
  onClose: () => void;
  onUpdate: (files: File[]) => void;
  onAddMore?: () => void; // optional
}

const DocumentAttachmentEditor = ({
  files,
  onClose,
  onUpdate,
}: DocumentAttachmentEditorProps) => {
  const handleRemoveDocument = (index: number) => {
    const updatedDocs = files.filter((_, i) => i !== index);
    onUpdate(updatedDocs);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
        {files.length === 0 && (
          <div className="text-gray-500 text-center mt-4">No documents selected</div>
        )}

        {files.map((file, idx) => (
          <FilePreview
            key={idx}
            file={file}
            removeFile={() => handleRemoveDocument(idx)}
          />
        ))}

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
