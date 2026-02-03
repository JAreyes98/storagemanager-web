import React, { useEffect, useState } from 'react';
import { storageApi } from '../../api/storageApi';
import { Database, Shield, ShieldOff, HardDrive, ExternalLink } from 'lucide-react';

const BucketsView = ({ selectedAppId }) => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAppId) {
      storageApi.getBuckets(selectedAppId)
        .then(res => setBuckets(res.data))
        .catch(err => console.error("Error cargando buckets", err))
        .finally(() => setLoading(false));
    }
  }, [selectedAppId]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buckets.map(bucket => (
          <div key={bucket.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Database size={24} />
              </div>
              {bucket.cipher ? (
                <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">
                  <Shield size={12} className="mr-1" /> Encrypted
                </span>
              ) : (
                <span className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">
                  <ShieldOff size={12} className="mr-1" /> Plain
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{bucket.name}</h3>
            <p className="text-sm text-slate-500 mb-4 uppercase tracking-tighter font-semibold">
              Provider: {bucket.provider_type}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
               <span className={`text-xs font-bold ${bucket.is_default ? 'text-emerald-600' : 'text-slate-400'}`}>
                 {bucket.is_default ? '● Primary Bucket' : 'Secondary'}
               </span>
               <button className="text-blue-600 text-sm font-bold hover:underline">
                 Explore Files
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BucketsView;