import { useState, useEffect, useCallback, useMemo } from "react";
import { FiX } from "react-icons/fi";
import Cropper from "react-easy-crop";

interface MediaFileWithAlt {
  file: File;
  alt?: string;
}

interface EditDialogProps {
  file: MediaFileWithAlt;
  onClose: () => void;
  onSave: (updated: MediaFileWithAlt) => void;
}

interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const filterMap: Record<string, string> = {
  none: "none",
  grayscale: "grayscale(100%)",
  sepia: "sepia(100%)",
  contrast: "contrast(120%)",
  brightness: "brightness(110%)",
};

const EditDialog = ({ file, onClose, onSave }: EditDialogProps) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"crop" | "filter" | "adjust">(
    "crop"
  );
  const [cropPixels, setCropPixels] = useState<CropPixels | null>(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState<number | null>(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filter, setFilter] = useState("none");

  const isImage = file.file.type.startsWith("image");

  useEffect(() => {
    const url = URL.createObjectURL(file.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!isImage) return;
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => setAspect(img.width / img.height);
  }, [previewUrl, isImage]);

  const combinedFilter = useMemo(() => {
    const base = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    return filter === "none" ? base : `${filterMap[filter]} ${base}`;
  }, [filter, brightness, contrast, saturation]);

  const handleApply = useCallback(async () => {
    if (!isImage) return onSave(file);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.src = previewUrl;
    await img.decode();

    const sx = cropPixels?.x ?? 0;
    const sy = cropPixels?.y ?? 0;
    const sw = cropPixels?.width ?? img.width;
    const sh = cropPixels?.height ?? img.height;

    canvas.width = sw;
    canvas.height = sh;

    ctx.filter = combinedFilter;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const newFile = new File([blob], file.file.name, {
        type: file.file.type,
      });
      onSave({ ...file, file: newFile });
    }, file.file.type);
  }, [file, previewUrl, cropPixels, combinedFilter, isImage, onSave]);

  const renderSlider = useCallback(
    (
      label: string,
      value: number,
      onChange: (v: number) => void,
      min = 50,
      max = 150
    ) => (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">{label}</label>
        <input
          placeholder="Adjust"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>
    ),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans p-4">
      <div className="bg-white w-full max-w-6xl h-[87vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Edit Media</h2>
          <button
            title="close"
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className="flex-1 flex items-center justify-center bg-gray-100"
            style={{ filter: isImage ? combinedFilter : "none" }}
          >
            {isImage ? (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect || undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                  setCropPixels(croppedAreaPixels)
                }
                objectFit="contain"
                showGrid
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="max-h-full max-w-full object-contain rounded"
              />
            )}
          </div>

          <div className="w-96 flex flex-col border-l border-gray-200 bg-white p-4">
            <div className="flex border-b border-gray-200 mb-4">
              {[
                { key: "crop", label: "Crop" },
                { key: "filter", label: "Filter" },
                { key: "adjust", label: "Adjust" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() =>
                    setActiveTab(key as "crop" | "filter" | "adjust")
                  }
                  className={`flex-1 text-sm font-medium py-2 transition ${
                    activeTab === key
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "crop" && isImage && (
                <div className="flex flex-col gap-4">
                  <label className="text-sm text-gray-600">Zoom</label>
                  <input
                    placeholder="zoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>
              )}

              {activeTab === "filter" && isImage && (
                <div className="flex flex-col gap-3">
                  {Object.keys(filterMap).map((key) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-3 py-1 rounded-full border transition ${
                        filter === key
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "adjust" && isImage && (
                <div className="flex flex-col gap-4">
                  {renderSlider("Brightness", brightness, setBrightness)}
                  {renderSlider("Contrast", contrast, setContrast)}
                  {renderSlider("Saturation", saturation, setSaturation)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
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