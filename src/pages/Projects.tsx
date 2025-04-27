import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProjects } from '../hooks/useProjects';
import { Link } from 'react-router-dom';
import { Tables, Enums } from '../types/supabase';

// Define type aliases for clarity
type Project = Omit<Tables<"projects">, "category" | "status"> & {
  category?: Enums<"project_category"> | null;
  status?: Enums<"project_status"> | null;
};
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
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Projects</h1>

      {/* Link to Create Project Page */}
      <div className="mb-6">
        <Link
          to="/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create New Project
        </Link>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Description</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Category</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Budget</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Manager</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t dark:border-gray-700">
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{project.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{project.description}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{project.location}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{project.category}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{project.status}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{project.budget.toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{project.manager}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={editingProject.description || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input
                  type="text"
                  value={editingProject.location}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, location: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={editingProject.category ?? ''} // Handle undefined
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, category: e.target.value === '' ? undefined : e.target.value as ProjectCategory })
                  }
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
                  value={editingProject.status ?? ''} // Handle undefined
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, status: e.target.value === '' ? undefined : e.target.value as ProjectStatus })
                  }
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
                  value={editingProject.start_date}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, start_date: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  value={editingProject.end_date || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      end_date: e.target.value || null,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget</label>
                <input
                  type="number"
                  value={editingProject.budget}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      budget: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manager</label>
                <input
                  type="text"
                  value={editingProject.manager}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, manager: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SDGs</label>
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
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                <input
                  type="text"
                  value={editingProject.image_url || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      image_url: e.target.value || null,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;