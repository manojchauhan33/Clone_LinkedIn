import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";

interface CropToolProps {
  image: string;
}

const CropTool = ({ image }: CropToolProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | null>(1);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    console.log("cropped area:", croppedAreaPixels);
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-gray-900 rounded-md overflow-hidden">
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={aspect || undefined}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-2/3"
        />
      </div>
    </div>
  );
};

export default CropTool;
