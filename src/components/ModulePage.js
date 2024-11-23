import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, List, AlertCircle } from 'lucide-react';
import CrudModule from './CrudModule';
import { endpoints } from '../config/api';

export default function ModulePage({ config }) {
  const { moduleName } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('list');
  const [error, setError] = useState(null);
  
  const moduleConfig = config.modules[moduleName];

  useEffect(() => {
    if (!moduleConfig) {
      setError('Module not found');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [moduleName, moduleConfig, navigate]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex items-center">
          <AlertCircle className="text-red-500 mr-3" size={24} />
          <h3 className="text-red-800 font-medium">{error}</h3>
        </div>
        <p className="mt-2 text-red-700">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{moduleConfig?.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your {moduleConfig?.title.toLowerCase()} data
          </p>
        </div>
        <button
          onClick={() => setActiveView(activeView === 'list' ? 'create' : 'list')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {activeView === 'list' ? (
            <>
              <Plus size={20} className="mr-2" />
              Add New
            </>
          ) : (
            <>
              <List size={20} className="mr-2" />
              View List
            </>
          )}
        </button>
      </div>

      {/* Module Content */}
      <CrudModule 
        config={config}
        moduleName={moduleName}
        endpoint={endpoints[moduleName]}
        view={activeView}
        onViewChange={setActiveView}
        onError={setError}
      />
    </div>
  );
}