// import { useState, useEffect, useCallback } from "react";
// import { FiTrash, FiPlus, FiX } from "react-icons/fi";
// import { MdOutlineModeEdit } from "react-icons/md";
// import EditDialog from "./EditDialog";

// interface MediaAttachmentEditorProps {
//   files: File[];
//   onClose: () => void;
//   onUpdate: (files: File[]) => void;
//   onAddMore: () => void;
// }

// interface MediaFileWithPreview {
//   file: File;
//   previewUrl: string;
// }

// const MediaAttachmentEditor = ({
//   files,
//   onClose,
//   onUpdate,
//   onAddMore,
// }: MediaAttachmentEditorProps) => {
//   const [mediaList, setMediaList] = useState<MediaFileWithPreview[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [mediaToEdit, setMediaToEdit] = useState<File | null>(null);

//   useEffect(() => {
//   const newMedia = files.map((f) => ({
//     file: f,
//     previewUrl: URL.createObjectURL(f),
//   }));
//   setMediaList(newMedia);

//   return () => newMedia.forEach((m) => URL.revokeObjectURL(m.previewUrl));
// }, [files]);

//   const currentMedia = mediaList[currentIndex];
//   const isImage = currentMedia?.file.type.startsWith("image");

//   const handleRemove = useCallback(() => {
//     if (!currentMedia) return;

//     URL.revokeObjectURL(currentMedia.previewUrl);
//     const newMedia = mediaList.filter((_, i) => i !== currentIndex);
//     setMediaList(newMedia);
//     onUpdate(newMedia.map((m) => m.file));

//     if (currentIndex >= newMedia.length && newMedia.length > 0) {
//       setCurrentIndex(newMedia.length - 1);
//     }
//   }, [mediaList, currentIndex, onUpdate, currentMedia]);

//   const handleSaveEdit = useCallback(
//     (updatedFile: File) => {
//       const updatedList = [...mediaList];
//       URL.revokeObjectURL(updatedList[currentIndex].previewUrl);
//       updatedList[currentIndex] = {
//         file: updatedFile,
//         previewUrl: URL.createObjectURL(updatedFile),
//       };
//       setMediaList(updatedList);
//       onUpdate(updatedList.map((m) => m.file));
//       setEditDialogOpen(false);
//     },
//     [mediaList, currentIndex, onUpdate]
//   );

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans">
//       <div className="bg-white w-[95%] max-w-6xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 relative">
//           <h2 className="text-xl font-bold text-gray-800">Edit Media</h2>
//           {mediaList.length > 0 && (
//             <div className="absolute top-4 right-20 text-sm font-semibold text-gray-600">
//               {currentIndex + 1} of {mediaList.length}
//             </div>
//           )}
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition"
//             title="Close Editor"
//           >
//             <FiX size={20} />
//           </button>
//         </div>

//         {/* Main Content */}
//         <div className="flex flex-1 overflow-hidden">
//           {/* Left: Preview */}
//           <div
//             className={`flex flex-col ${
//               mediaList.length > 0 ? "flex-[1.5]" : "flex-1"
//             } p-4 items-center justify-center`}
//           >
//             {mediaList.length === 0 ? (
//               <button
//                 onClick={onAddMore}
//                 className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition text-lg font-semibold"
//               >
//                 <FiPlus size={20} /> Upload Media
//               </button>
//             ) : (
//               <>
//                 <div className="flex-1 bg-gray-900 rounded-sm flex items-center justify-center overflow-hidden shadow-inner w-full">
//                   {isImage ? (
//                     <img
//                       src={currentMedia.previewUrl}
//                       alt={currentMedia.file.name}
//                       className="max-w-full max-h-full object-contain p-2"
//                     />
//                   ) : (
//                     <video
//                       src={currentMedia.previewUrl}
//                       controls
//                       preload="metadata"
//                       className="max-w-full max-h-full object-contain p-2"
//                     />
//                   )}
//                 </div>

//                 <div className="flex justify-between items-center pt-3 mt-2 w-full">
//                   <button
//                     onClick={() => {
//                       setMediaToEdit(currentMedia.file);
//                       setEditDialogOpen(true);
//                     }}
//                     className="flex items-center justify-center w-10 h-10 text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition shadow-md"
//                     title="Edit File"
//                   >
//                     <MdOutlineModeEdit size={16} />
//                   </button>

//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={handleRemove}
//                       className="flex items-center justify-center w-10 h-10 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition shadow-md"
//                       title="Delete File"
//                     >
//                       <FiTrash size={16} />
//                     </button>
//                     <button
//                       onClick={onAddMore}
//                       className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition shadow-md"
//                       title="Add More Files"
//                     >
//                       <FiPlus size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Right: Thumbnails */}
//           {mediaList.length > 0 && (
//             <div className="w-80 flex flex-col p-4 bg-gray-50 border-l border-gray-100 overflow-y-auto">
//               <div className="grid grid-cols-2 gap-2">
//                 {mediaList.map((m, idx) => {
//                   const isThumbImage = m.file.type.startsWith("image");
//                   return (
//                     <div
//                       key={idx}
//                       className={`relative cursor-pointer rounded-lg overflow-hidden flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-300 hover:shadow-md h-40 ${
//                         currentIndex === idx ? "ring-2 ring-blue-500" : ""
//                       }`}
//                       onClick={() => setCurrentIndex(idx)}
//                       title={m.file.name}
//                     >
//                       {isThumbImage ? (
//                         <img
//                           src={m.previewUrl}
//                           alt={`Thumbnail ${idx + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <video
//                           src={m.previewUrl}
//                           preload="metadata"
//                           muted
//                           className="w-full h-full object-cover opacity-70"
//                         />
//                       )}
//                       <div className="absolute bottom-1 left-1 text-xs font-bold text-white bg-black/70 px-1 rounded-sm">
//                         {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-100 bg-gray-50">
//           <button
//             onClick={onClose}
//             className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition font-semibold"
//           >
//             Done
//           </button>
//         </div>
//       </div>

//       {/* Edit Dialog */}
//       {editDialogOpen && mediaToEdit && (
//         <EditDialog
//           file={{ file: mediaToEdit }}
//           onClose={() => setEditDialogOpen(false)}
//           onSave={handleSaveEdit}
//         />
//       )}
//     </div>
//   );
// };

// export default MediaAttachmentEditor;

import { useState, useEffect, useCallback, memo } from "react";
import { FiTrash, FiPlus, FiX } from "react-icons/fi";
import { MdOutlineModeEdit } from "react-icons/md";
import EditDialog from "./EditDialog";

interface MediaAttachmentEditorProps {
  files: File[];
  onClose: () => void;
  onUpdate: (files: File[]) => void;
  onAddMore: () => void;
}

interface MediaFileWithPreview {
  file: File;
  previewUrl: string;
}

interface ThumbnailProps {
  media: MediaFileWithPreview;
  index: number;
  isSelected: boolean;
  onSelect: (idx: number) => void;
}

const Thumbnail = memo(
  ({ media, index, isSelected, onSelect }: ThumbnailProps) => {
    const isImage = media.file.type.startsWith("image");

    return (
      <div
        className={`relative cursor-pointer rounded-lg overflow-hidden flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-300 hover:shadow-md h-40 ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => onSelect(index)}
        title={media.file.name}
      >
        {isImage ? (
          <img
            src={media.previewUrl}
            alt={media.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={media.previewUrl}
            preload="metadata"
            muted
            className="w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute bottom-1 left-1 text-xs font-bold text-white bg-black/70 px-1 rounded-sm">
          {index + 1 < 10 ? `0${index + 1}` : index + 1}
        </div>
      </div>
    );
  }
);

const MediaAttachmentEditor = ({
  files,
  onClose,
  onUpdate,
  onAddMore,
}: MediaAttachmentEditorProps) => {
  const [mediaList, setMediaList] = useState<MediaFileWithPreview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mediaToEdit, setMediaToEdit] = useState<File | null>(null);

  useEffect(() => {
    const newMedia = files.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setMediaList(newMedia);
    return () => newMedia.forEach((m) => URL.revokeObjectURL(m.previewUrl));
  }, [files]);

  const currentMedia = mediaList[currentIndex];
  const isImage = currentMedia?.file.type.startsWith("image");

  const handleRemove = useCallback(() => {
    if (!currentMedia) return;
    URL.revokeObjectURL(currentMedia.previewUrl);
    const newMedia = mediaList.filter((_, i) => i !== currentIndex);
    setMediaList(newMedia);
    onUpdate(newMedia.map((m) => m.file));
    if (currentIndex >= newMedia.length && newMedia.length > 0) {
      setCurrentIndex(newMedia.length - 1);
    }
  }, [mediaList, currentIndex, onUpdate, currentMedia]);

  const handleSaveEdit = useCallback(
    (updatedFile: File) => {
      const updatedList = [...mediaList];
      URL.revokeObjectURL(updatedList[currentIndex].previewUrl);
      updatedList[currentIndex] = {
        file: updatedFile,
        previewUrl: URL.createObjectURL(updatedFile),
      };
      setMediaList(updatedList);
      onUpdate(updatedList.map((m) => m.file));
      setEditDialogOpen(false);
    },
    [mediaList, currentIndex, onUpdate]
  );

  const handleSelectThumbnail = useCallback(
    (idx: number) => setCurrentIndex(idx),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans">
      <div className="bg-white w-[95%] max-w-6xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 relative">
          <h2 className="text-xl font-bold text-gray-800">Edit Media</h2>
          {mediaList.length > 0 && (
            <div className="absolute top-4 right-20 text-sm font-semibold text-gray-600">
              {currentIndex + 1} of {mediaList.length}
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition"
            title="Close Editor"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Preview */}
          <div
            className={`flex flex-col ${
              mediaList.length > 0 ? "flex-[1.5]" : "flex-1"
            } p-4 items-center justify-center`}
          >
            {mediaList.length === 0 ? (
              <button
                onClick={onAddMore}
                className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition text-lg font-semibold"
              >
                <FiPlus size={20} /> Upload Media
              </button>
            ) : (
              <>
                <div className="flex-1 bg-gray-900 rounded-sm flex items-center justify-center overflow-hidden shadow-inner w-full">
                  {isImage ? (
                    <img
                      src={currentMedia.previewUrl}
                      alt={currentMedia.file.name}
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  ) : (
                    <video
                      src={currentMedia.previewUrl}
                      controls
                      preload="metadata"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 mt-2 w-full">
                  <button
                    onClick={() => {
                      setMediaToEdit(currentMedia.file);
                      setEditDialogOpen(true);
                    }}
                    className="flex items-center justify-center w-10 h-10 text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition shadow-md"
                    title="Edit File"
                  >
                    <MdOutlineModeEdit size={16} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRemove}
                      className="flex items-center justify-center w-10 h-10 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition shadow-md"
                      title="Delete File"
                    >
                      <FiTrash size={16} />
                    </button>
                    <button
                      onClick={onAddMore}
                      className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition shadow-md"
                      title="Add More Files"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Thumbnails */}
          {mediaList.length > 0 && (
            <div className="w-80 flex flex-col p-4 bg-gray-50 border-l border-gray-100 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {mediaList.map((m, idx) => (
                  <Thumbnail
                    key={m.file.name + idx}
                    media={m}
                    index={idx}
                    isSelected={currentIndex === idx}
                    onSelect={handleSelectThumbnail}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition font-semibold"
          >
            Done
          </button>
        </div>
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && mediaToEdit && (
        <EditDialog
          file={{ file: mediaToEdit }}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default memo(MediaAttachmentEditor);
