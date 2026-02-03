import React, { useState, useEffect } from 'react';
import { storageApi } from '../../api/storageApi';
import { Layout, Key, ShieldCheck, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const AppManagement = () => {
  const [apps, setApps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSecret, setShowSecret] = useState({}); // Para ocultar/ver secrets individuales
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    app_name: '',
    is_active: true
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const res = await storageApi.getApps();
      setApps(res.data || []);
    } catch (err) {
      console.error("Error loading apps", err);
    }
  };

  const toggleSecret = (id) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSaving) return;
      
      setIsSaving(true);
      
      try {
        const cleanPayload = {
          app_name: String(formData.app_name).trim(),
          is_active: true
        };

        console.log("Payload:", cleanPayload); 
        
        await storageApi.createApp(cleanPayload);
        
        setShowSuccess(true);
        
        await loadApps(); 

        setTimeout(() => {
          setShowSuccess(false);
          setIsModalOpen(false);
          setFormData({ app_name: '', is_active: true });
          setIsSaving(false);
        }, 1500);

      } catch (err) {
        setIsSaving(false);
        console.error("Server error:", err.response?.data);
        alert(err.response?.data?.error || "Error creating app. Please try again.");
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Applications</h1>
          <p className="text-gray-500 text-sm">Manage API credentials for your services</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Create New App
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {apps.map((app) => (
          <div key={app.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                  <Layout size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{app.app_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span className={`h-2 w-2 rounded-full ${app.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {app.is_active ? 'ACTIVE' : 'INACTIVE'} • ID: {app.id}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
            <div className="mt-4 flex gap-6 border-t border-b border-gray-50 py-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Linked Buckets</span>
                <span className="text-sm font-semibold text-gray-700">{app.buckets?.length || 0}</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-6">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Storage</span>
                <span className="text-sm font-semibold text-gray-700">
                  {formatBytes(app.buckets?.reduce((acc, bucket) => acc + (bucket.total_size || 0), 0))}
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API KEY */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase">API Key</label>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-sm text-indigo-700 font-mono">{app.api_key}</code>
                  <Key size={14} className="text-gray-300" />
                </div>
              </div>

              {/* API SECRET */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Api Secret</label>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-sm text-gray-700 font-mono">
                    {showSecret[app.id] ? app.api_secret : '••••••••••••••••'}
                  </code>
                  <button onClick={() => toggleSecret(app.id)} className="text-gray-400 hover:text-gray-600">
                    {showSecret[app.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-indigo-600 text-white">
              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-xl font-bold">New Application</h2>
              <p className="text-indigo-100 text-xs">A new API Key & Secret will be generated.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Service Name</label>
                <input 
                  required
                  autoFocus
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. auth-service"
                  value={formData.app_name}
                  onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                />
              </div>

              {showSuccess && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                  <div className="bg-emerald-500 rounded-full p-0.5 text-white">
                    <Plus size={12} strokeWidth={4} />
                  </div>
                  Application registered successfully!
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                >
                  {isSaving ? 'Generating...' : 'Create App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppManagement;