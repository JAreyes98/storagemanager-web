import React, { useState, useEffect } from 'react';
import { storageApi } from '../../api/storageApi';
import { Plus, Database, ExternalLink, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROVIDER_FIELDS = {
    LOCAL: [
        { name: 'path', label: 'Storage Path', type: 'text', placeholder: '/var/www/uploads' }
    ],
    S3: [
        { name: 'bucket_name', label: 'S3 Bucket Name', type: 'text', placeholder: 'my-s3-bucket' },
        { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' },
        { name: 'path', label: 'Root Folder', type: 'text', placeholder: 'storage/images' },
        { name: 'access_key', label: 'Access Key ID', type: 'text', placeholder: 'AKIA...' },
        { name: 'secret_key', label: 'Secret Access Key', type: 'password', placeholder: 'Your Secret Key' }
    ],
    DROPBOX: [
        { name: 'access_token', label: 'Access Token', type: 'password', placeholder: 'sl.u.token...' },
        { name: 'path', label: 'Root Folder', type: 'text', placeholder: '/apps/storage' }
    ],
};

const Buckets = () => {
    const [buckets, setBuckets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apps, setApps] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedApp, setSelectedApp] = useState('all'); // Filter state
    
    const [formData, setFormData] = useState({
        name: '',
        provider_type: 'LOCAL',
        app_id: '',
        is_default: false,
        cipher: false
    });

    const [extraConfig, setExtraConfig] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bucketsRes, appsRes] = await Promise.all([
                storageApi.getAllBuckets(),
                storageApi.getApps()
            ]);
            setBuckets(bucketsRes.data || []);
            setApps(appsRes.data || []);
        } catch (err) {
            console.error("Error loading data", err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            provider_type: 'LOCAL',
            app_id: '',
            is_default: false,
            cipher: false
        });
        setExtraConfig({});
    };

    const handleExtraConfigChange = (name, value) => {
        setExtraConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                config: JSON.stringify(extraConfig),
            };

            await storageApi.registerBucket(payload);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setIsModalOpen(false);
                loadData();
                resetForm();
            }, 2000);
        } catch (err) {
            console.error("Registration error:", err);
            alert("Error: " + (err.response?.data?.error || "Check backend console"));
        }
    };

    const filteredBuckets = selectedApp === 'all' 
        ? buckets 
        : buckets.filter(b => b.app_id === selectedApp || b.app?.id === selectedApp);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Storage Buckets</h1>
                    <p className="text-sm text-gray-500">Manage your cloud and local storage providers</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            value={selectedApp}
                            onChange={(e) => setSelectedApp(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[200px]"
                        >
                            <option value="all">All Applications</option>
                            {apps.map(app => (
                                <option key={app.id} value={app.id}>{app.app_name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} /> Register New Bucket
                    </button>
                </div>
            </div>

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
                        {filteredBuckets.map((bucket) => (
                            <tr key={bucket.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <button 
                                        onClick={() => navigate(`/buckets/${bucket.id}/files`)}
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                    >
                                        <Database size={16} />
                                        {bucket.name}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getProviderStyle(bucket.provider_type)}`}>
                                        {bucket.provider_type.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                                        {bucket.app?.app_name || 'N/A'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] block max-w-[150px] truncate">
                                        {bucket.config}
                                    </code>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getCipherStyle(bucket.cipher)}`}>
                                        {bucket.cipher ? 'Encrypted' : 'Plain'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-600 text-sm">
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
                        {filteredBuckets.length === 0 && (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-400 text-sm italic">
                                    No buckets found for the selected criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Register New Bucket</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Owner Application</label>
                                <select 
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.app_id}
                                    onChange={(e) => setFormData({...formData, app_id: e.target.value})}
                                >
                                    <option value="">Select an application...</option>
                                    {apps.map(app => (
                                        <option key={app.id} value={app.id}>{app.app_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Provider</label>
                                    <select 
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none"
                                        value={formData.provider_type}
                                        onChange={(e) => {
                                            setFormData({...formData, provider_type: e.target.value});
                                            setExtraConfig({});
                                        }}
                                    >
                                        {Object.keys(PROVIDER_FIELDS).map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bucket Name</label>
                                    <input 
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                                        placeholder="prod-storage"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                                <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Provider Specific Config</p>
                                {PROVIDER_FIELDS[formData.provider_type]?.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{field.label}</label>
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            value={extraConfig[field.name] || ''}
                                            onChange={(e) => handleExtraConfigChange(field.name, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <label className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                        checked={formData.cipher}
                                        onChange={(e) => setFormData({...formData, cipher: e.target.checked})}
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-700">Cipher</span>
                                        <span className="block text-[10px] text-gray-400">AES-256</span>
                                    </div>
                                </label>
                                <label className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-700">Default</span>
                                        <span className="block text-[10px] text-gray-400">Primary</span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                {showSuccess && (
                                    <div className="text-green-600 text-sm font-medium flex items-center gap-2 animate-bounce">
                                        ✓ Success!
                                    </div>
                                )}
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm text-gray-500">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">Save Bucket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const getProviderStyle = (provider) => {
    switch(provider.toLowerCase()) {
        case 's3': return 'bg-orange-100 text-orange-700';
        case 'dropbox': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getCipherStyle = (cipher) => cipher ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';

export default Buckets;