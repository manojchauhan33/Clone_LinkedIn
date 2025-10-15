import { useState } from "react";

interface AdjustToolProps {
  image: string;
}

const AdjustTool = ({ image }: AdjustToolProps) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={image}
        alt="Adjust Preview"
        className="max-h-80 rounded-md"
        style={filterStyle}
      />

      <div className="w-full flex flex-col gap-3">
        <label className="text-sm text-gray-600">Brightness</label>
        <input
          type="range"
          min="50"
          max="150"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
        />

        <label className="text-sm text-gray-600">Contrast</label>
        <input
          type="range"
          min="50"
          max="150"
          value={contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
        />

        <label className="text-sm text-gray-600">Saturation</label>
        <input
          type="range"
          min="50"
          max="150"
          value={saturation}
          onChange={(e) => setSaturation(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default AdjustTool;
