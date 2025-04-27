import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/supabase';
import { Link } from 'react-router-dom'; // Import Link

// Define the Project type using Supabase schema
type Project = Tables<"projects">;

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }
      setProjects(data || []);
    };
    fetchProjects();

    // Real-time subscription for projects
    const subscription = supabase
      .channel('projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjects((prev) => [...prev, payload.new as Project]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects((prev) =>
            prev.map((proj) => (proj.id === payload.new.id ? payload.new as Project : proj))
          );
        } else if (payload.eventType === 'DELETE') {
          setProjects((prev) => prev.filter((proj) => proj.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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

  if (!projects) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center"> {/* Modified this line */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <Link to="/projects/new"> {/* Added Link component */}
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200">
              Add New Project
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
            >
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
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
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
                        : project.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : project.status === 'Planning'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p>
                    <span className="font-medium">Location:</span> {project.location}
                  </p>
                  <p>
                    <span className="font-medium">Manager:</span> {project.manager}
                  </p>
                  <p>
                    <span className="font-medium">Budget:</span> ${project.budget.toLocaleString()}
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
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg sm:max-w-md mx-4 my-8 shadow-2xl transform transition-all duration-300">
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
                    rows={3}
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
                      setEditingProject({ ...editingProject, category: e.target.value as 'Environmental' | 'Social' | 'Governance' })
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
                      setEditingProject({ ...editingProject, status: e.target.value as 'Planning' | 'Active' | 'Completed' | 'Cancelled' })
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
                      setEditingProject({ ...editingProject, end_date: e.target.value || null })
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
                    SDG Goals
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
                      setEditingProject({ ...editingProject, image_url: e.target.value || null })
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