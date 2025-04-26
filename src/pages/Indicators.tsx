import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Plus, Edit, Trash2, Search } from 'lucide-react';

// Define interfaces
interface Indicator {
  id: string;
  project_id: string;
  name: string;
  value: number;
  unit: string;
  category: 'Environmental' | 'Social' | 'Governance';
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Indicators() {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [newIndicator, setNewIndicator] = useState({
    project_id: '',
    name: '',
    value: 0,
    unit: '',
    category: 'Environmental' as 'Environmental' | 'Social' | 'Governance',
  });
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch indicators and projects
  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view indicators');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch indicators
        const { data: indicatorData, error: indicatorError } = await supabase
          .from('project_indicators')
          .select('*')
          .order('created_at', { ascending: false });

        if (indicatorError) throw new Error(`Failed to fetch indicators: ${indicatorError.message}`);

        // Fetch projects
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, name')
          .order('name');

        if (projectError) throw new Error(`Failed to fetch projects: ${projectError.message}`);

        setIndicators(indicatorData || []);
        setProjects(projectData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('project_indicators')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_indicators' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIndicators((prev) => [payload.new as Indicator, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIndicators((prev) =>
            prev.map((ind) => (ind.id === payload.new.id ? (payload.new as Indicator) : ind))
          );
        } else if (payload.eventType === 'DELETE') {
          setIndicators((prev) => prev.filter((ind) => ind.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handle add indicator
  const handleAddIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to add an indicator');
      return;
    }

    if (!newIndicator.project_id || !newIndicator.name || !newIndicator.unit || newIndicator.value < 0) {
      setError('Please fill all required fields and ensure value is non-negative');
      return;
    }

    try {
      const { error } = await supabase.from('project_indicators').insert([newIndicator]);
      if (error) throw new Error(`Failed to add indicator: ${error.message}`);

      setNewIndicator({ project_id: '', name: '', value: 0, unit: '', category: 'Environmental' });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error:', err);
    }
  };

  // Handle edit indicator
  const handleEditIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndicator || !user) return;

    try {
      const { error } = await supabase
        .from('project_indicators')
        .update({
          name: editingIndicator.name,
          value: editingIndicator.value,
          unit: editingIndicator.unit,
          category: editingIndicator.category,
        })
        .eq('id', editingIndicator.id);

      if (error) throw new Error(`Failed to update indicator: ${error.message}`);

      setShowEditModal(false);
      setEditingIndicator(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error:', err);
    }
  };

  // Handle delete indicator
  const handleDeleteIndicator = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this indicator?')) return;

    try {
      const { error } = await supabase.from('project_indicators').delete().eq('id', id);
      if (error) throw new Error(`Failed to delete indicator: ${error.message}`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error:', err);
    }
  };

  // Filter and search indicators
  const filteredIndicators = indicators.filter((ind) => {
    const matchesSearch = ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.unit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || ind.category === filterCategory;
    const matchesProject = filterProject === 'All' || ind.project_id === filterProject;
    return matchesSearch && matchesCategory && matchesProject;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center sm:text-left">Manage Indicators</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-slide-in">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search indicators..."
                className="w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Environmental">Environmental</option>
                <option value="Social">Social</option>
                <option value="Governance">Governance</option>
              </select>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="All">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Add Indicator
            </button>
          </div>
        </div>

        {/* Indicators Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : filteredIndicators.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No indicators found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIndicators.map((indicator) => (
                  <tr key={indicator.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indicator.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicator.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicator.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicator.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {projects.find((p) => p.id === indicator.project_id)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingIndicator(indicator);
                          setShowEditModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-800 mr-4"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteIndicator(indicator.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Indicator Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Indicator</h2>
              <form onSubmit={handleAddIndicator} className="space-y-4">
                <div>
                  <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">Project</label>
                  <select
                    id="project_id"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.project_id}
                    onChange={(e) => setNewIndicator({ ...newIndicator, project_id: e.target.value })}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.name}
                    onChange={(e) => setNewIndicator({ ...newIndicator, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="number"
                    id="value"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.value}
                    onChange={(e) => setNewIndicator({ ...newIndicator, value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    id="unit"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.unit}
                    onChange={(e) => setNewIndicator({ ...newIndicator, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.category}
                    onChange={(e) => setNewIndicator({ ...newIndicator, category: e.target.value as 'Environmental' | 'Social' | 'Governance' })}
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add Indicator
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Indicator Modal */}
        {showEditModal && editingIndicator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Indicator</h2>
              <form onSubmit={handleEditIndicator} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.name}
                    onChange={(e) => setEditingIndicator({ ...editingIndicator, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="number"
                    id="edit-value"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.value}
                    onChange={(e) => setEditingIndicator({ ...editingIndicator, value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="edit-unit" className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    id="edit-unit"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.unit}
                    onChange={(e) => setEditingIndicator({ ...editingIndicator, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="edit-category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.category}
                    onChange={(e) => setEditingIndicator({ ...editingIndicator, category: e.target.value as 'Environmental' | 'Social' | 'Governance' })}
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}