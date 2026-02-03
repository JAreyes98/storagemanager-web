import React, { useState, useEffect } from 'react';
import { storageApi } from '../../api/storageApi';
import { Plus, Database, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Buckets = () => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apps, setApps] = useState([]); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider_type: 'LOCAL',
    region: 'us-east-1',
    app_id: '',
    access_key: '',
    secret_key: ''
    });
   const navigate = useNavigate();
   
    useEffect(() => {
        loadBuckets();
    }, []);


    const resetForm = () => {
        setFormData({
            name: '',
            provider_type: 'LOCAL',
            region: 'us-east-1',
            app_id: '',
            access_key: '',
            secret_key: '',
            path: '', 
            is_default: false,
            cipher: false
        });
    };

    const handleOpenModal = async () => {
    try {
        const res = await storageApi.getApps();
        setApps(res.data || []);
        setIsModalOpen(true);
    } catch (err) {
        console.error("Error fetching apps for dropdown:", err);
        alert("Could not load applications. Please try again.");
    }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Definimos el config basado en el proveedor
            let configValue = "";
            
            if (formData.provider_type === "AWS_S3") {
            configValue = JSON.stringify({
                config: JSON.stringify({ path: formData.path })
            });
            } else {
            configValue = JSON.stringify({ path: formData.path });
            }

            const payload = {
                name: formData.name,
                app_id: formData.app_id,
                provider_type: formData.provider_type, // "LOCAL" o "AWS_S3"
                config: configValue,
                is_default: formData.is_default,
                cipher: formData.cipher,
            };

            await storageApi.registerBucket(payload);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setIsModalOpen(false);
                loadBuckets();
                resetForm();
            }, 2000);
            
        } catch (err) {
            console.error("Error al registrar:", err);
            alert("Error: " + (err.response?.data?.error || "Revisa la consola del backend"));
        }
        };

  const loadBuckets = async () => {
    try {
      const res = await storageApi.getAllBuckets();
      setBuckets(res.data);
    } catch (err) {
      console.error("Error loading buckets", err);
    } finally {
      setLoading(false);
    }
  };



  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Storage Buckets</h1>
        <button 
            onClick={handleOpenModal} // <--- Conectamos aquí
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
            <Plus size={20} /> Register New Bucket
        </button>
      </div>

      {/* Tabla de Buckets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Provider</th>
              <th className="p-4 font-semibold text-gray-600">App</th>
              <th className="p-4 font-semibold text-gray-600">Config</th>
              <th className="p-4 font-semibold text-gray-600">Cipher</th>
              <th className="p-4 font-semibold text-gray-600">Size</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr key={bucket.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                {/* Dentro del renderizado de la tabla en Buckets.jsx */}
                <td className="p-4">
                    <button 
                        onClick={() => navigate(`/buckets/${bucket.id}/files`)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        <Database size={16} />
                        {bucket.name}
                    </button>
                </td>
                {/* <td className="p-4 flex items-center gap-3">
                  <Database size={18} className="text-blue-500" />
                  <span className="font-medium text-gray-700">{bucket.name}</span>
                </td> */}
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getProviderStyle(bucket.provider_type)}`}>
                    {bucket.provider_type.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                        {bucket.app?.app_name || 'Unknown App name'}
                    </span>
                </td>
                <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                        {bucket.config || 'Unknown Config'}
                    </span>
                </td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getCipherStyle(bucket.cipher)}`}>
                        {bucket.cipher ? 'Encrypted' : 'Not Encrypted'}
                    </span>
                </td>
                <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                        {formatBytes(bucket.total_size || 0)}
                    </span>
                </td>
                <td className="p-4 flex gap-3">
                  <button className="text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                  <button 
                    onClick={() => navigate(`/buckets/${bucket.id}/files`)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                    <ExternalLink size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {buckets.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-500">No buckets registered yet.</div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Register New Bucket</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Selección de App (Foreign Key) */}
                <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Owner Application</label>
                <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormData({...formData, app_id: e.target.value})}
                >
                    <option value="">Select an application...</option>
                    {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.app_name} ({app.api_key})</option>
                    ))}
                </select>
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Storage Provider
                </label>
                <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none"
                    value={formData.provider_type} // <--- Forzamos que coincida con el estado
                    onChange={(e) => setFormData({...formData, provider_type: e.target.value})}
                    >
                    <option value="LOCAL">Local Storage (Disk)</option>
                    <option value="AWS_S3">Amazon S3</option>
                    </select>
                </div>

                <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bucket Name</label>
                <input 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                    placeholder="e.g. patients-records-prod"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Storage Path</label>
                    <input
                    type="text"
                    placeholder="/data/storage/uploads"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm"
                    value={formData.path}
                    onChange={(e) => setFormData({...formData, path: e.target.value})}
                    />
                </div>

                <div className="flex gap-4">
                    <label className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={formData.cipher}
                        onChange={(e) => setFormData({...formData, cipher: e.target.checked})}
                    />
                    <div>
                        <span className="block text-sm font-bold text-gray-700">Enable Encryption</span>
                        <span className="block text-[10px] text-gray-400">AES-256 bit encryption at rest</span>
                    </div>
                    </label>

                    <label className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={formData.is_default}
                        onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    />
                    <div>
                        <span className="block text-sm font-bold text-gray-700">Set as Default</span>
                        <span className="block text-[10px] text-gray-400">Primary bucket for this app</span>
                    </div>
                    </label>
                </div>
                <div className="flex gap-3 justify-end mt-8">
                {showSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    </div>
                    <span className="text-sm font-medium">Bucket registered successfully!</span>
                </div>
                )}
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-100 transition-all"
                >
                    Save Bucket
                </button>
                </div>
            </form>
            </div>
        </div>
        )}
    </div>
  );
};

// Helper para colores de proveedores
const getProviderStyle = (provider) => {
  switch(provider.toLowerCase()) {
    case 'aws': return 'bg-orange-100 text-orange-700';
    case 'gcp': return 'bg-blue-100 text-blue-700';
    case 'azure': return 'bg-cyan-100 text-cyan-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};
// Helper para colores de proveedores
const getCipherStyle = (cipher) => {
    return cipher ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
};

export default Buckets;