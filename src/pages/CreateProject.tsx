// src/pages/CreateProject.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Define ProjectFormData to match database schema
interface ProjectFormData {
  name: string;
  description: string | null;
  location: string;
  category: 'Environmental' | 'Social' | 'Governance';
  start_date: string;
  end_date: string | null;
  budget: number;
  manager: string;
  sdgs: number[];
  status?: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  created_by?: string | null;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const initialFormData: ProjectFormData = {
    name: '',
    description: '',
    location: '',
    category: 'Environmental',
    start_date: '',
    end_date: null,
    budget: 0,
    manager: '',
    sdgs: [],
    status: 'Planning',
    created_by: user?.id || null,
  };

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  const validateForm = (data: ProjectFormData) => {
    if (!data.name) return 'Project name is required';
    if (!data.location) return 'Location is required';
    if (!data.start_date) return 'Start date is required';
    if (!data.manager) return 'Project manager is required';
    if (data.budget < 0) return 'Budget cannot be negative';
    if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
      return 'End date cannot be before start date';
    }
    if (data.sdgs.some(sdg => sdg < 1 || sdg > 17)) {
      return 'SDGs must be between 1 and 17';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!user) {
      setError('You must be logged in to create a project');
      setLoading(false);
      return;
    }

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const projectData: ProjectFormData = {
        ...formData,
        created_by: user.id,
        status: formData.status || 'Planning',
      };

      const { error: supabaseError } = await supabase
        .from('projects')
        .insert([projectData]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }

      setSuccess(true);
      setTimeout(() => navigate('/projects'), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the project';
      console.error('Error details:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Project</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-success-50 text-success-700 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Project created successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectFormData['category'] })}
            >
              <option value="Environmental">Environmental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              id="location"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Project Manager</label>
            <input
              type="text"
              id="manager"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="start_date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="end_date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
            <input
              type="number"
              id="budget"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label htmlFor="sdgs" className="block text-sm font-medium text-gray-700">SDGs</label>
            <select
              multiple
              id="sdgs"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.sdgs.map(String)}
              onChange={(e) => {
                const sdgs = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                setFormData({ ...formData, sdgs });
              }}
            >
              {Array.from({ length: 17 }, (_, i) => i + 1).map(sdg => (
                <option key={sdg} value={sdg}>SDG {sdg}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}