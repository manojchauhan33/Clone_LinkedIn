import React, { useState } from "react";
import { FaTimes, FaGlobe, FaUserFriends } from "react-icons/fa";

type PostVisibility = "public" | "connection-only";

interface SettingsDialogProps {
  close: () => void;
  currentVisibility: PostVisibility;
  onUpdate: (visibility: PostVisibility) => void;
}

const PostSettingsDialog: React.FC<SettingsDialogProps> = ({
  close,
  currentVisibility,
  onUpdate,
}) => {
  const [selectedVisibility, setSelectedVisibility] =
    useState(currentVisibility);

  const handleDone = () => {
    onUpdate(selectedVisibility);
    close();
  };

  const options = [
    {
      value: "public",
      label: "Public",
      description: "Anyone on or off LinkedIn",
      icon: <FaGlobe className="w-5 h-5 text-gray-700" />,
    },
    {
      value: "connection-only",
      label: "Connections only",
      description: "Only people you're connected to",
      icon: <FaUserFriends className="w-5 h-5 text-gray-700" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Post settings</h2>
          <button
            onClick={close}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full text-xl"
            aria-label="closse dialog"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">
            Who can see your post?
          </h3>
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() =>
                setSelectedVisibility(option.value as PostVisibility)
              }
            >
              <div className="mr-3 mt-1">{option.icon}</div>
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <input
                type="radio"
                name="postVisibility"
                placeholder="input"
                checked={selectedVisibility === option.value}
                onChange={() =>
                  setSelectedVisibility(option.value as PostVisibility)
                }
                className="w-5 h-5 mt-2 text-blue-600"
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={close}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSettingsDialog;