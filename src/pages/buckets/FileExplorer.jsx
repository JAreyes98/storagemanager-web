import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; //
import { storageApi } from '../../api/storageApi';
import { ArrowLeft, FileText, Image as ImageIcon, Eye, Lock } from 'lucide-react';
import FilePreviewModal from '../../components/FilePreviewModal';

const BucketFileExplorer = () => {
  const { bucketId } = useParams(); // Extrae el ID definido en el Path de la ruta
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bucketId) {
      loadFiles();
      loadBucket();
    }
  }, [bucketId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await storageApi.getFilesByBucket(bucketId);
      setFiles(res.data || []);
    } catch (err) {
      console.error("Error loading files", err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadBucket = async () => {
      try {
        const res = await storageApi.getBucketById(bucketId);
        
        localStorage.setItem('active_api_key', res.data.app.api_key);
        localStorage.setItem('active_api_secret', res.data.app.api_secret);
        
        loadFiles(); 
      } catch (err) {
        console.error("Error al obtener credenciales del bucket", err);
      }
  };

  return (
    <div className="p-6">
      {/* Botón Back para volver a Buckets */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/buckets')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Buckets
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Bucket Files</h2>
          <p className="text-xs text-gray-400 font-mono">{bucketId}</p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Size</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-indigo-50/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {file.originalName.toLowerCase().endsWith('.pdf') ? (
                      <FileText size={18} className="text-red-500" />
                    ) : (
                      <ImageIcon size={18} className="text-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{file.originalName}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {/* Aquí asumo que ya tienes tu función formatBytes */}
                  {(file.fileSize / 1024).toFixed(2)} KB
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(file.createdAt).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => {
                      if (file.is_ciphered) {
                        alert("This file is encrypted and cannot be previewed directly.");
                      } else {
                        setSelectedFile(file);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ml-auto ${
                      file.is_ciphered 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {file.is_ciphered ? <Lock size={14} /> : <Eye size={14} />}
                    {file.is_ciphered ? 'ENCRYPTED' : 'VIEW'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && files.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">
            No files found in this bucket.
          </div>
        )}

        {selectedFile && (
          <FilePreviewModal 
            file={selectedFile} 
            onClose={() => setSelectedFile(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default BucketFileExplorer;