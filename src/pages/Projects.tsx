import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, Search, Filter, ArrowDownUp } from 'lucide-react';
import ProjectCard from '../components/projects/ProjectCard';
import { useProjects } from '../hooks/useProjects';

const Projects = () => {
  const { projects, loading } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filteredProjects = projects
    .filter(project => 
      (searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (categoryFilter === '' || project.category === categoryFilter) &&
      (statusFilter === '' || project.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      } else if (sortBy === 'budget') {
        return b.budget - a.budget;
      }
      return 0;
    });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-600">Manage your impact projects</p>
        </div>
        <Link
          to="/projects/new"
          className="btn-primary mt-4 sm:mt-0"
        >
          <FolderPlus size={18} className="mr-2" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              className="form-select pl-10"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Environmental">Environmental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
            </select>
          </div>
          
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArrowDownUp size={18} className="text-gray-400" />
            </div>
            <select
              className="form-select pl-10"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="budget">Sort by Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="text-gray-400 mb-4">
            <FolderPlus size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter || statusFilter ? 
              'Try adjusting your filters or search terms' : 
              'Get started by creating your first project'}
          </p>
          <Link to="/projects/new" className="btn-primary">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;