import React, { useState, useEffect } from 'react';
import replicationService from '../../api/replicationService';
import { storageApi } from '../../api/storageApi';

const ReplicationManager = () => {
  const [rules, setRules] = useState([]);
  const [allBuckets, setAllBuckets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [formData, setFormData] = useState({ 
    sourceBucketId: '', 
    targetBucketId: '',
    appId: '' 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Traemos TODO lo global
      const [rulesRes, bucketsRes] = await Promise.all([
        replicationService.getAllRules(),
        storageApi.getAllBuckets() // Asumiendo que tienes este endpoint global
      ]);
      setRules(rulesRes.data || []);
      setAllBuckets(bucketsRes.data || []);
    } catch (err) {
      console.error("Error loading global replication data", err);
    }
  };

  const handleSourceChange = (e) => {
    const sourceId = e.target.value;
    const selectedSource = allBuckets.find(b => b.id === sourceId);
    
    if (selectedSource) {
      // Filtrar targets: Deben ser de la misma App pero diferente ID
      const targets = allBuckets.filter(b => 
        b.app_id === selectedSource.app_id && b.id !== sourceId
      );
      setFilteredTargets(targets);
      setFormData({
        ...formData,
        sourceBucketId: sourceId,
        appId: selectedSource.app_id,
        targetBucketId: '' // Reset target if source changes
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await replicationService.createRule(formData);
      setFormData({ sourceBucketId: '', targetBucketId: '', appId: '' });
      setFilteredTargets([]);
      loadData();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Check your connection"));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Global Replication Control</h2>
      
      <form onSubmit={handleCreate} className="bg-slate-800 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-white text-sm mb-1">Source Bucket (From any App)</label>
          <select 
            className="w-full p-2 rounded bg-slate-700 text-white"
            value={formData.sourceBucketId}
            onChange={handleSourceChange}
            required
          >
            <option value="">Select Source...</option>
            {allBuckets.map(b => (
              <option key={b.id} value={b.id}>{b.app?.app_name} - {b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white text-sm mb-1">Target Bucket (Same App)</label>
          <select 
            className="w-full p-2 rounded bg-slate-700 text-white disabled:opacity-50"
            value={formData.targetBucketId}
            onChange={(e) => setFormData({...formData, targetBucketId: e.target.value})}
            disabled={!formData.sourceBucketId}
            required
          >
            <option value="">Select Target...</option>
            {filteredTargets.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.provider_type})</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors">
            Create Replication Rule
          </button>
        </div>
      </form>

      {/* Rules List */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-100 text-sm uppercase">
            <th className="p-3">App</th>
            <th className="p-3">Source</th>
            <th className="p-3">Target</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{rule.replicationOnApp?.app_name}</td>
              <td className="p-3 font-medium">{rule.sourceBucket?.name} ({rule.sourceBucket?.provider_type})</td>
              <td className="p-3 text-blue-600">{rule.targetBucket?.name} ({rule.targetBucket?.provider_type})</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${rule.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {rule.active ? 'Syncing/Active' : 'Paused'}
                </span>
              </td>
              <td className="p-3 flex gap-2">
                <button 
                  onClick={() => handleToggle(rule.id)}
                  className={`px-3 py-1 rounded text-white text-sm ${rule.active ? 'bg-orange-500' : 'bg-green-600'}`}
                >
                  {rule.active ? 'Pause' : 'Enable & Sync'}
                </button>
                <button 
                  onClick={() => replicationService.deleteRule(rule.id).then(loadData)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReplicationManager;