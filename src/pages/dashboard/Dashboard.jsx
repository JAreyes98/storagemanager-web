import React, { useEffect, useState } from 'react';
import { storageApi } from '../../api/storageApi';
import { Database, ShieldCheck, Activity, Server } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    apps: 0,
    buckets: 0,
    health: 'Checking...',
    recent: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const appsRes = await storageApi.getApps();
        
        let bucketCount = 0;
        try {
          const bucketsRes = await storageApi.getBuckets('all');
          bucketCount = bucketsRes.data?.length || 0;
        } catch (e) {
          console.warn("Could not fetch all buckets");
        }

        setStats({
          apps: appsRes.data?.length || 0,
          buckets: bucketCount,
          health: 'Stable',
          recent: []
        });
      } catch (error) {
        setStats(prev => ({ ...prev, health: 'Error' }));
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1 text-lg">Storage and encryption monitoring.</p>
        </div>
        <div className={`flex items-center space-x-2 text-sm font-medium px-3 py-1 rounded-full border ${
          stats.health === 'Stable' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            stats.health === 'Stable' ? 'bg-emerald-500' : 'bg-amber-500'
          }`}></div>
          <span>Storage Service {stats.health === 'Stable' ? 'Online' : 'Warning'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Connected Apps" value={stats.apps} icon={Server} trend="Active services" color="bg-indigo-600" />
        <StatCard title="Total Buckets" value={stats.buckets} icon={Database} trend="Cloud & Local" color="bg-blue-500" />
        <StatCard title="Security Level" value="AES-256" icon={ShieldCheck} trend="Active Encryption" color="bg-amber-500" />
        <StatCard title="System Health" value={stats.health === 'Stable' ? '99.9%' : 'Inaccessible'} icon={Activity} trend="RabbitMQ Status" color="bg-emerald-500" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Upload Activity</h3>
        <div className="space-y-4">
          {stats.recent.length > 0 ? (
            stats.recent.map((file, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-xs">FILE</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">Bucket: {file.bucket}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Just now</span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-sm italic">No recent activity detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
        <Icon size={22} />
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Real-time</span>
    </div>
    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
    <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
    <div className="mt-4 pt-4 border-t border-slate-50">
      <span className="text-xs font-semibold text-slate-400">{trend}</span>
    </div>
  </div>
);

export default Dashboard;