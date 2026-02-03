import React, { useState } from 'react';

const NewAppModal = ({ isOpen, onClose, onSave }) => {
  const [appName, setAppName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Register New Application</h2>
        <p className="text-slate-500 text-sm mb-6">Define el nombre del microservicio que se integrará con el storage.</p>
        
        <input 
          type="text"
          className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="e.g. billing-service"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />

        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 font-medium hover:text-slate-700">Cancel</button>
          <button 
            onClick={() => { onSave(appName); setAppName(''); onClose(); }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            Create App
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppModal;