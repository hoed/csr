import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth'; // Import useAuth
import { AlertCircle } from 'lucide-react';

interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  category: 'Environmental' | 'Social' | 'Governance';
  start_date: string;
  end_date: string;
  budget: number;
  manager: string;
  sdgs: number[];
  status?: 'Planning' | 'Active' | 'Completed' | 'Cancelled'; // Add status
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get authenticated user
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initialFormData: ProjectFormData = {
    name: '',
    description: '',
    location: '',
    category: 'Environmental',
    start_date: '',
    end_date: '',
    budget: 0,
    manager: '',
    sdgs: [],
    status: 'Planning', // Default status
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

    // Validate form data
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Ensure user is authenticated
    if (!user) {
      setError('You must be logged in to create a project');
      setLoading(false);
      return;
    }

    try {
      const projectData = {
        ...formData,
        created_by: user.id, // Add user ID
        status: formData.status || 'Planning', // Ensure status is set
      };

      const { error: supabaseError } = await supabase
        .from('projects')
        .insert([projectData]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError); // Log detailed error
        throw new Error(supabaseError.message);
      }

      navigate('/projects');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the project';
      console.error('Error details:', err); // Log full error for debugging
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
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
            <label htmlFor="sdgs" className="block text-sm font-medium text-gray-700">SDGs (comma-separated, 1-17)</label>
            <input
              type="text"
              id="sdgs"
              placeholder="e.g., 1,3,5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.sdgs.join(',')}
              onChange={(e) => {
                const sdgs = e.target.value
                  .split(',')
                  .map(s => parseInt(s.trim()))
                  .filter(s => !isNaN(s) && s >= 1 && s <= 17);
                setFormData({ ...formData, sdgs });
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={formData.description}
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