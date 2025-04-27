import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Tables, Enums } from '../types/supabase';

// Define type aliases for clarity
type Project = Tables<"projects">;
type ProjectIndicator = Tables<"project_indicators">;
type ProjectCategory = Enums<"project_category">;
type ProjectStatus = Enums<"project_status">;

const CreateProject = () => {
  const navigate = useNavigate();
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    location: '',
    category: undefined, // Changed from '' to undefined
    status: undefined,  // Changed from '' to undefined
    start_date: '',
    end_date: null,
    budget: 0,
    manager: '',
    sdgs: [],
    image_url: null,
  });
  const [newIndicators, setNewIndicators] = useState<Partial<ProjectIndicator>[]>([]);

  // Handle creating a new project
  const handleCreate = async () => {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      console.error('Error getting auth session:', authError);
      alert('You must be logged in to create a project');
      return;
    }

    const createdBy = authData.session.user.id;
    const now = new Date().toISOString();

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        ...newProject,
        created_by: createdBy,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      alert('Failed to create project');
      return;
    }

    // Insert new indicators
    if (newIndicators.length > 0) {
      const indicatorsToInsert = newIndicators.map((indicator) => ({
        project_id: projectData.id,
        name: indicator.name,
        value: indicator.value ?? 0,
        unit: indicator.unit,
        category: indicator.category,
        created_at: now,
        updated_at: now,
      }));

      const { error: indicatorError } = await supabase
        .from('project_indicators')
        .insert(indicatorsToInsert);

      if (indicatorError) {
        console.error('Error creating project indicators:', indicatorError);
        alert('Project created, but failed to create indicators');
        return;
      }
    }

    alert('Project created successfully');
    navigate('/projects');
  };

  // Add a new indicator field
  const addNewIndicator = () => {
    setNewIndicators([...newIndicators, { name: '', value: 0, unit: '', category: '' }]);
  };

  // Update a new indicator field
  const updateNewIndicator = (index: number, field: keyof ProjectIndicator, value: any) => {
    const updatedIndicators = [...newIndicators];
    updatedIndicators[index] = { ...updatedIndicators[index], [field]: value };
    setNewIndicators(updatedIndicators);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Project</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={newProject.description || ''}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <input
              type="text"
              value={newProject.location}
              onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              value={newProject.category ?? ''} // Use ?? '' to handle undefined in the UI
              onChange={(e) => setNewProject({ ...newProject, category: e.target.value === '' ? undefined : e.target.value as ProjectCategory })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Category</option>
              <option value="Environmental">Environmental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              value={newProject.status ?? ''} // Use ?? '' to handle undefined in the UI
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value === '' ? undefined : e.target.value as ProjectStatus })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Status</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              value={newProject.start_date}
              onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <input
              type="date"
              value={newProject.end_date || ''}
              onChange={(e) =>
                setNewProject({ ...newProject, end_date: e.target.value || null })
              }
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget</label>
            <input
              type="number"
              value={newProject.budget || 0}
              onChange={(e) =>
                setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })
              }
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manager</label>
            <input
              type="text"
              value={newProject.manager}
              onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter the project manager's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SDGs</label>
            <input
              type="text"
              value={newProject.sdgs?.join(', ') || ''}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  sdgs: e.target.value
                    .split(',')
                    .map((s) => parseInt(s.trim()))
                    .filter((n) => !isNaN(n)),
                })
              }
              placeholder="e.g., 7, 13"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
            <input
              type="text"
              value={newProject.image_url || ''}
              onChange={(e) =>
                setNewProject({ ...newProject, image_url: e.target.value || null })
              }
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Key Performance Indicators */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Key Performance Indicators
            </label>
            {newIndicators.map((indicator, index) => (
              <div key={index} className="border border-gray-300 dark:border-gray-600 p-4 mt-2 rounded-md space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={indicator.name || ''}
                    onChange={(e) => updateNewIndicator(index, 'name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
                  <input
                    type="number"
                    value={indicator.value || 0}
                    onChange={(e) =>
                      updateNewIndicator(index, 'value', parseInt(e.target.value) || 0)
                    }
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                  <input
                    type="text"
                    value={indicator.unit || ''}
                    onChange={(e) => updateNewIndicator(index, 'unit', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={indicator.category || ''}
                    onChange={(e) => updateNewIndicator(index, 'category', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Category</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
              </div>
            ))}
            <button
              onClick={addNewIndicator}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add Indicator
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-gray-900 dark:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;