import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProjects } from '../hooks/useProjects';
import { Link } from 'react-router-dom';
import { Tables, Enums } from '../types/supabase';

// Define type aliases for clarity
type Project = Tables<"projects">;
type ProjectCategory = Enums<"project_category">;
type ProjectStatus = Enums<"project_status">;

const Projects = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle editing a project
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  // Handle updating a project
  const handleUpdate = async () => {
    if (!editingProject) return;

    // Validate required fields (safety net, as <select> ensures these are set)
    if (!editingProject.category) {
      alert('Please select a category');
      return;
    }
    if (!editingProject.status) {
      alert('Please select a status');
      return;
    }

    const { error } = await supabase
      .from('projects')
      .update({
        name: editingProject.name,
        description: editingProject.description,
        location: editingProject.location,
        category: editingProject.category,
        status: editingProject.status,
        start_date: editingProject.start_date,
        end_date: editingProject.end_date,
        budget: editingProject.budget,
        manager: editingProject.manager,
        sdgs: editingProject.sdgs,
        image_url: editingProject.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingProject.id);

    if (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
      return;
    }

    alert('Project updated successfully');
    setIsEditModalOpen(false);
    setEditingProject(null);
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
            Our Projects
          </h1>
          <Link
            to="/projects/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Create New Project
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
            >
              {/* Project Image */}
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={
                    project.image_url ||
                    'https://via.placeholder.com/400x200?text=No+Image+Available'
                  }
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Project Details */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {project.description || 'No description available.'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      project.category === 'Environmental'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : project.category === 'Social'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}
                  >
                    {project.category}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      project.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : project.status === 'Planning'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : project.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p>
                    <span className="font-medium">Budget:</span>{' '}
                    {project.budget.toLocaleString()} USD
                  </p>
                  <p>
                    <span className="font-medium">Manager:</span> {project.manager}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {project.location}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(project)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Edit Project
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Project Modal */}
        {isEditModalOpen && editingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-2xl w-full mx-4 shadow-2xl transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Edit Project
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, name: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingProject.description || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingProject.location}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, location: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
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
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
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
                    value={editingProject.start_date}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, start_date: e.target.value })
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
                    value={editingProject.end_date || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        end_date: e.target.value || null,
                      })
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
                    value={editingProject.budget}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        budget: parseInt(e.target.value) || 0,
                      })
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
                    value={editingProject.manager}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, manager: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SDGs
                  </label>
                  <input
                    type="text"
                    value={editingProject.sdgs?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editingProject.image_url || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        image_url: e.target.value || null,
                      })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Save
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