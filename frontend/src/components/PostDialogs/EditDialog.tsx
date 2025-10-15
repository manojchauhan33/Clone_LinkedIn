import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { FaCrop, FaFilter, FaSlidersH } from "react-icons/fa";
import CropTool from "./Editmedia/CropTool";
import FilterTool from "./Editmedia/FilterTool";
import AdjustTool from "./Editmedia/AdjustTool";

interface MediaFileWithAlt {
  file: File;
  alt?: string;
}

interface EditDialogProps {
  file: MediaFileWithAlt;
  onClose: () => void;
  onSave: (updated: MediaFileWithAlt) => void;
}

const EditDialog = ({ file, onClose, onSave }: EditDialogProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"crop" | "filter" | "adjust">(
    "crop"
  );

  useEffect(() => {
    const url = URL.createObjectURL(file.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isImage = file.file.type.startsWith("image");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 font-sans p-4">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Edit Media</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 bg-[#0d1117] flex items-center justify-center">
            {isImage ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-full max-w-full object-contain rounded-md"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="max-h-full max-w-full rounded-md"
              />
            )}
          </div>

          <div className="w-80 flex flex-col border-l border-gray-200 bg-white">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("crop")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                  activeTab === "crop"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaCrop /> Crop
              </button>
              <button
                onClick={() => setActiveTab("filter")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                  activeTab === "filter"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaFilter /> Filter
              </button>
              <button
                onClick={() => setActiveTab("adjust")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                  activeTab === "adjust"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaSlidersH /> Adjust
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isImage && (
                <>
                  {activeTab === "crop" && <CropTool image={previewUrl} />}
                  {activeTab === "filter" && <FilterTool image={previewUrl} />}
                  {activeTab === "adjust" && <AdjustTool image={previewUrl} />}
                </>
              )}
              {!isImage && (
                <p className="text-gray-600 text-center mt-10">
                  Video editing features are not available yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(file)}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDialog;