import React, { useEffect, useState } from 'react';
import { HardDrive, Shield, ShieldOff, Plus } from 'lucide-react';
import storageService from '../../api/storageApi';

const BucketList = () => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Por ahora usaremos un ID de App estático para probar, 
  // luego lo traeremos de la selección de Apps
  const tempAppId = "tu-uuid-de-app-aqui"; 

  useEffect(() => {
    // Simulación de carga hasta que el Gateway esté listo
    const fetchBuckets = async () => {
      try {
        // const res = await storageService.getBucketsByApp(tempAppId);
        // setBuckets(res.data);
      } catch (err) {
        console.error("Error fetching buckets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuckets();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Buckets Management</h1>
          <p className="text-slate-500">Configuración de contenedores y políticas de cifrado.</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>Register Bucket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Placeholder de tabla de Buckets */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Provider</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Encryption</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Ejemplo de fila basada en tu modelo model.Bucket */}
              <tr>
                <td className="px-6 py-4 font-medium text-slate-700">patient-records-prod</td>
                <td className="px-6 py-4 text-slate-500 text-sm">S3 / AWS</td>
                <td className="px-6 py-4">
                  <span className="flex items-center text-amber-600 text-sm font-medium">
                    <Shield size={16} className="mr-1" /> Encrypted
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold uppercase">Default</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Files</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BucketList;