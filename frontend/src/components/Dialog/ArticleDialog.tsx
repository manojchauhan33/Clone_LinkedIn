interface DialogProps {
  close: () => void;
}

const ArticleDialog = ({ close }: DialogProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-md shadow-lg p-5 relative">
        <button
          onClick={close}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-3">Write an article</h2>
        <textarea
          placeholder="Write your article here..."
          className="w-full border rounded-md p-2 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={6}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Post Article
        </button>
      </div>
    </div>
  );
};

export default ArticleDialog;
