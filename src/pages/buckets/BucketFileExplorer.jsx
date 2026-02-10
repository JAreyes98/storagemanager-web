import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageApi } from '../../api/storageApi';
import { 
  ArrowLeft, FileText, Image as ImageIcon, Eye, Lock, 
  Copy, Check, ShieldCheck, HardDrive, Key, Code 
} from 'lucide-react';
import FilePreviewModal from '../../components/FilePreviewModal';

const BucketFileExplorer = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [bucket, setBucket] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (bucketId) {
      loadInitialData();
    }
  }, [bucketId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Get bucket details first to have credentials
      const resBucket = await storageApi.getBucketById(bucketId);
      setBucket(resBucket.data);
      
      // Store in localStorage for the interceptors as you were doing
      localStorage.setItem('active_api_key', resBucket.data.app.api_key);
      localStorage.setItem('active_api_secret', resBucket.data.app.api_secret);
      
      // Load files using those credentials
      const resFiles = await storageApi.getFilesByBucket(bucketId);
      setFiles(resFiles.data || []);
    } catch (err) {
      console.error("Error loading bucket data", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const InfoCard = ({ label, value, icon: Icon, fieldId, sensitive = false }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-center justify-between group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Icon size={18} />
        </div>
        <div className="overflow-hidden">
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
          <p className={`text-sm font-mono truncate ${sensitive ? 'blur-sm group-hover:blur-none transition-all duration-300' : 'text-gray-700'}`}>
            {value || 'Not defined'}
          </p>
        </div>
      </div>
      <button 
        onClick={() => copyToClipboard(value, fieldId)}
        className="ml-2 p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"
      >
        {copiedField === fieldId ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Navigation & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate('/buckets')}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium mb-2 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Buckets
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <HardDrive className="text-indigo-600" />
            {bucket?.name || 'Loading Bucket...'}
          </h1>
        </div>
        
        {bucket && (
          <div className="flex items-center gap-2">
             <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
               <ShieldCheck size={14} /> Active Application: {bucket.app?.app_name}
             </span>
          </div>
        )}
      </div>

      {/* Integration Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InfoCard 
          label="Application ID" 
          value={bucket?.app?.id} 
          icon={Code} 
          fieldId="appId" 
        />
        <InfoCard 
          label="Bucket ID" 
          value={bucket?.id} 
          icon={HardDrive} 
          fieldId="bucketId" 
        />
        <InfoCard 
          label="API Key (X-API-Key)" 
          value={bucket?.app?.api_key} 
          icon={Key} 
          fieldId="apiKey" 
          sensitive={true}
        />
        <InfoCard 
          label="API Secret (X-API-Secret)" 
          value={bucket?.app?.api_secret} 
          icon={Lock} 
          fieldId="apiSecret" 
          sensitive={true}
        />
      </div>

      {/* Files Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} /> Explorer
          </h2>
          <span className="text-xs text-gray-400">{files.length} files found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Size</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-indigo-50/30 transition-all group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-gray-100 rounded-lg group-hover:border-indigo-200 transition-colors">
                        {file.originalName.toLowerCase().endsWith('.pdf') ? (
                          <FileText size={18} className="text-red-500" />
                        ) : (
                          <ImageIcon size={18} className="text-blue-500" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{file.originalName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {(file.fileSize / 1024).toFixed(2)} KB
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => !file.is_ciphered && setSelectedFile(file)}
                      disabled={file.is_ciphered}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 ${
                        file.is_ciphered 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-200'
                      }`}
                    >
                      {file.is_ciphered ? <Lock size={14} /> : <Eye size={14} />}
                      {file.is_ciphered ? 'ENCRYPTED' : 'PREVIEW'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && files.length === 0 && (
          <div className="p-20 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-medium">No files in this bucket yet</p>
            <p className="text-xs text-gray-400 mt-1">Files uploaded via API will appear here</p>
          </div>
        )}
      </div>

      {selectedFile && (
        <FilePreviewModal 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}
    </div>
  );
};

export default BucketFileExplorer;