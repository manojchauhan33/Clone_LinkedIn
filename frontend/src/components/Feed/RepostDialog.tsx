import React from "react";
import { MdAccountCircle } from "react-icons/md";
import { RepostWithUser } from "../../api/Post";

interface RepostDialogProps {
  onClose: () => void;
  reposts: RepostWithUser[];
  loading: boolean;
}

const RepostDialog: React.FC<RepostDialogProps> = ({
  onClose,
  reposts,
  loading,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[1000] overflow-auto py-8">
      <div className="bg-white rounded w-[90%] max-w-3xl max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">
            {reposts.length} Repost{reposts.length !== 1 ? "s" : ""}
          </h3>
          <button onClick={onClose} className="text-gray-600 font-bold text-lg">
            X
          </button>
        </div>

        {/* Body */}
        <div className="overflow-auto p-6 flex-1 scroll-smooth">
          {loading ? (
            <p className="text-center py-16 text-gray-500 text-lg">
              Loading reposts...
            </p>
          ) : reposts.length === 0 ? (
            <p className="text-center py-16 text-gray-500 text-lg">
              No reposts yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {reposts.map((r) => (
                <li
                  key={r.repostId}
                  className="border border-gray-200 rounded-lg shadow-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <MdAccountCircle className="w-10 h-10 text-gray-400 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {r.user?.name} reposted
                      </p>

                      
                        <p className="text-gray-700 mt-1 text-sm">
                          {r.repostComment}
                        </p>
                    

                      {/* <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.createdAt).toLocaleString()}
                      </p> */}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepostDialog;
