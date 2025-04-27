import { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { Tables, Enums } from '../types/supabase';

// Define type aliases for clarity
type Project = Tables<"projects">;
type ProjectCategory = Enums<"project_category">;
type ProjectStatus = Enums<"project_status">;

const Projects = () => {
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    location: '',
    category: 'Environmental', // Set default value
    status: 'Planning', // Set default value
    start_date: '',
    end_date: null,
    budget: 0,
    manager: '',
    sdgs: [],
    image_url: null,
  });

  // Real-time subscription for projects
  useEffect(() => {
    const subscription = supabase
      .channel('projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newProject = payload.new as Project;
          // Assuming useProjects updates the projects state, we don't need to update it here
        } else if (payload.eventType === 'UPDATE') {
          const updatedProject = payload.new as Project;
          // Assuming useProjects updates the projects state
        } else if (payload.eventType === 'DELETE') {
          // Assuming useProjects updates the projects state
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Handle creating a new project
  const handleCreate = async () => {
    // Validate required fields
    if (!newProject.name) {
      alert('Name is required');
      return;
    }

    const projectData = {
      name: newProject.name,
      description: newProject.description || null,
      location: newProject.location || '',
      category: newProject.category ?? 'Environmental', // Ensure non-null
      status: newProject.status ?? 'Planning', // Ensure non-null
      start_date: newProject.start_date || null,
      end_date: newProject.end_date || null,
      budget: newProject.budget || 0,
      manager: newProject.manager || null,
      sdgs: newProject.sdgs?.length ? newProject.sdgs : null,
      image_url: newProject.image_url || null,
    };

    const { error } = await createProject({...projectData, manager: projectData.manager || '', start_date: projectData.start_date || ''});

    if (error) {
      alert('Failed to create project');
      return;
    }

    alert('Project created successfully');
    setIsCreateModalOpen(false);
    setNewProject({
      name: '',
      description: '',
      location: '',
      category: 'Environmental', // Reset to default
      status: 'Planning', // Reset to default
      start_date: '',
      end_date: null,
      budget: 0,
      manager: '',
      sdgs: [],
      image_url: null,
    });
  };

  if (projectsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Create Project
          </button>
        </div>

        {/* Projects Section */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description || 'No description available.'}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>
                      <span className="font-medium">Location:</span>{' '}
                      {project.location || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span>{' '}
                      {project.category || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      {project.status || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Start Date:</span>{' '}
                      {project.start_date || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span>{' '}
                      {project.end_date || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Budget:</span>{' '}
                      {project.budget ? `$${project.budget}` : 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">Manager:</span>{' '}
                      {project.manager || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium">SDGs:</span>{' '}
                      {project.sdgs?.join(', ') || 'None'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Project Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-lg w-full mx-4 my-8 shadow-2xl transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Create Project
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProject.description || ''}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newProject.location || ''}
                    onChange={(e) =>
                      setNewProject({ ...newProject, location: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newProject.category}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        category: e.target.value as ProjectCategory,
                      })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        status: e.target.value as ProjectStatus,
                      })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newProject.start_date || ''}
                    onChange={(e) =>
                      setNewProject({ ...newProject, start_date: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newProject.end_date || ''}
                    onChange={(e) =>
                      setNewProject({ ...newProject, end_date: e.target.value || null })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={newProject.budget || 0}
                    onChange={(e) =>
                      setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager
                  </label>
                  <input
                    type="text"
                    value={newProject.manager || ''}
                    onChange={(e) =>
                      setNewProject({ ...newProject, manager: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Enter the project manager's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SDGs
                  </label>
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
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;