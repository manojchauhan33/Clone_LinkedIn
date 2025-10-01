import { useState, useCallback } from "react";
import { MdPhotoSizeSelectActual, MdAccountCircle } from "react-icons/md";
import { RiVideoFill } from "react-icons/ri";
import { PiArticleNyTimesThin } from "react-icons/pi";
import PostDialog from "./Dialog/PostDialog";
import PhotoDialog from "./Dialog/PhotoDialog"; // Import PhotoDialog
import VideoDialog from "./Dialog/VideoDialog"; // Import VideoDialog
import ArticleDialog from "./Dialog/ArticleDialog"; 
// import { useAuth } from "../context/AuthContext";

const Post = () => {
  const [postOpen, setPostOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false); // Re-enable for the file wrapper
  const [videoOpen, setVideoOpen] = useState(false); // Re-enable for the file wrapper
  const [articleOpen, setArticleOpen] = useState(false);
  
  // New state to hold a file if it comes from PhotoDialog or VideoDialog
  const [initialPostFile, setInitialPostFile] = useState<File | null>(null);

  // const { user } = useAuth();

  // Function to close the main PostDialog and reset the initial file
  const closePostDialog = useCallback(() => {
    setPostOpen(false);
    setInitialPostFile(null); // Crucial: clear file after post or cancellation
  }, []);

  // Unified function to open the PostDialog, setting the initial file if provided
  const openPostDialog = useCallback((file: File | null = null) => {
    setInitialPostFile(file);
    setPostOpen(true);
  }, []);
  
  // Function passed to Photo/Video dialogs to open PostDialog with the file
  const handleMediaFileChosen = useCallback((file: File | null) => {
      if (file) {
          openPostDialog(file); // Open main dialog with the file
      }
  }, [openPostDialog]);


  return (
    <>
      <div className="bg-white p-3 rounded-md shadow-md mb-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
        
            <MdAccountCircle className="w-12 h-12 text-gray-500" />
          

          {/* Post Input - Opens PostDialog without an initial file */}
          <input
            type="text"
            placeholder="Start a post"
            readOnly
            onClick={() => openPostDialog()} 
            className="flex-1 border rounded-full px-4 py-2 cursor-pointer text-gray-600"
          />
        </div>

        <div className="flex justify-around text-gray-500 text-sm mt-2">
          {/* Video Button - Opens VideoDialog wrapper */}
          <button
            className="flex items-center gap-2 hover:text-blue-600"
            onClick={() => setVideoOpen(true)}
          >
            <RiVideoFill size={20} className="text-green-500" /> Video
          </button>
          
          {/* Photo Button - Opens PhotoDialog wrapper */}
          <button
            className="flex items-center gap-2 hover:text-blue-600"
            onClick={() => setPhotoOpen(true)}
          >
            <MdPhotoSizeSelectActual size={20} className="text-blue-500" /> Photo
          </button>
          
          <button
            className="flex items-center gap-2 hover:text-blue-600"
            onClick={() => setArticleOpen(true)}
          >
            <PiArticleNyTimesThin size={20} className="text-red-400" /> Article
          </button>
        </div>
      </div>

      {/* Main Post Dialog: Handles text and file submission */}
      {postOpen && (
       <PostDialog 
          close={closePostDialog} 
          initialFiles={initialPostFile ? [initialPostFile] : []} 
      />
      )}
      
      {/* Photo Dialog: Triggers file input and calls handleMediaFileChosen on selection */}
      {photoOpen && (
        <PhotoDialog 
            close={() => setPhotoOpen(false)} 
            openPostDialog={handleMediaFileChosen} 
        />
      )}
      
      {/* Video Dialog: Triggers file input and calls handleMediaFileChosen on selection */}
      {videoOpen && (
        <VideoDialog 
            close={() => setVideoOpen(false)} 
            openPostDialog={handleMediaFileChosen} 
        />
      )}

      {/* Article Dialog (Remains Separate) */}
      {articleOpen && <ArticleDialog close={() => setArticleOpen(false)} />}
    </>
  );
};

export default Post;