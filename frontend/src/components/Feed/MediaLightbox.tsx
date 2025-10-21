import React, { useState } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MediaItem } from "./Feed";

interface MediaLightboxProps {
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prev = () =>
    setCurrentIndex(currentIndex === 0 ? media.length - 1 : currentIndex - 1);
  const next = () =>
    setCurrentIndex(currentIndex === media.length - 1 ? 0 : currentIndex + 1);

  const currentMedia = media[currentIndex];
  const hasMultiple = media.length > 1;

  return (
    <div className="fixed inset-0 bg-[#1d2226]/80 z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="relative flex w-[85%] max-w-5xl h-[80vh] bg-[#1d2226]  overflow-hidden shadow-2xl">
        {hasMultiple && (
          <button
            aria-label="prev"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-3xl p-2 hover:bg-gray-800 rounded-full z-20"
          >
            <FaChevronLeft />
          </button>
        )}

        <div className="flex-1 flex items-center justify-center bg-black">
          {currentMedia.type === "video" ? (
            <video
              src={currentMedia.url}
              controls
              className="max-h-[75vh] max-w-[95%] object-contain rounded-lg"
            />
          ) : currentMedia.type === "image" ? (
            <img
              src={currentMedia.url}
              alt={`media-${currentIndex}`}
              className="max-h-[75vh] max-w-[95%] object-contain rounded-lg"
            />
          ) : (
            <a
              href={currentMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline"
            >
              {/* Open Document */}
            </a>
          )}
        </div>

        <button
          aria-label="close"
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-2xl p-2 hover:bg-gray-800 rounded-full"
        >
          <FaTimes />
        </button>

        {hasMultiple && (
          <button
            aria-label="next"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-3xl p-2 hover:bg-gray-800 rounded-full z-20"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaLightbox;