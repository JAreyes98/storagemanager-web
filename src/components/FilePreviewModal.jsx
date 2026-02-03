import React, { useState, useEffect } from 'react';
import { storageApi } from '../api/storageApi';
import { X, Loader2 } from 'lucide-react';

const FilePreviewModal = ({ file, onClose }) => {
  const [contentUrl, setContentUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const response = await storageApi.getFileContent(file.id);
        const url = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
        setContentUrl(url);
      } catch (err) {
        console.error("Error fetching file content", err);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
    return () => {
      if (contentUrl) URL.revokeObjectURL(contentUrl);
    };
  }, [file.id]);

  const isImage = file.originalName.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPdf = file.originalName.match(/\.(pdf)$/i);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-gray-800">{file.originalName}</h3>
            <p className="text-xs text-gray-400">{file.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <span className="text-sm text-gray-500 font-medium">Downloading encrypted content...</span>
            </div>
          ) : (
            <>
              {isImage && <img src={contentUrl} alt={file.originalName} className="max-w-full max-h-full object-contain shadow-lg" />}
              {isPdf && <iframe src={`${contentUrl}#toolbar=0`} className="w-full h-full rounded-lg shadow-inner" title="PDF Viewer" />}
              {!isImage && !isPdf && (
                <div className="text-center">
                  <p className="text-gray-500">Preview not available for this file type.</p>
                  <a href={contentUrl} download={file.originalName} className="text-indigo-600 font-bold underline">Download instead</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;