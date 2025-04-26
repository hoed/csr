import React from 'react';
import { Calendar, MapPin, DollarSign, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../../hooks/useProjects';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Environmental':
        return '🌱';
      case 'Social':
        return '👥';
      case 'Governance':
        return '📊';
      default:
        return '📋';
    }
  };

  return (
    <div className="card h-full transition-all hover:transform hover:translate-y-[-4px] group">
      <div className="relative h-40 bg-gray-200 rounded-t-lg overflow-hidden">
        {project.image_url ? (
          <img 
            src={project.image_url} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-500">
            <span className="text-4xl">{getCategoryIcon(project.category)}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
          {project.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={16} className="mr-2 text-gray-400" />
            <span>{project.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2 text-gray-400" />
            <span>
              {format(new Date(project.start_date), 'MMM d, yyyy')}
              {project.end_date && ` to ${format(new Date(project.end_date), 'MMM d, yyyy')}`}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign size={16} className="mr-2 text-gray-400" />
            <span>${project.budget.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Tag size={16} className="mr-2 text-gray-400 flex-shrink-0" />
            <span>{project.category}</span>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex">
            {project.sdgs?.map((sdg) => (
              <div 
                key={sdg}
                className="w-8 h-8 rounded-full mr-1 flex items-center justify-center text-xs font-semibold bg-primary-50 text-primary-700"
                title={`SDG ${sdg}`}
              >
                {sdg}
              </div>
            ))}
          </div>
          
          <Link 
            to={`/projects/${project.id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;