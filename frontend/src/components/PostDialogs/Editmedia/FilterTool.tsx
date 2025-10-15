import { useState } from "react";

interface FilterToolProps {
  image: string;
}

const FilterTool = ({ image }: FilterToolProps) => {
  const [filter, setFilter] = useState("none");

  const filters = {
    none: "none",
    grayscale: "grayscale(100%)",
    sepia: "sepia(100%)",
    contrast: "contrast(120%)",
    brightness: "brightness(110%)",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={image}
        alt="Filtered"
        className="max-h-80 rounded-md transition-all duration-300"
        style={{ filter: filters[filter as keyof typeof filters] }}
      />

      <div className="flex gap-3 overflow-x-auto py-2">
        {Object.keys(filters).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full border ${
              filter === key
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTool;
