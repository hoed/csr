import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  User, 
  BarChart3, 
  PlusCircle, 
  LineChart, 
  FileText, 
  Download, 
  Trash2, 
  Edit, 
  Globe,
  Tag 
} from 'lucide-react';
import { useProjects, Project } from '../hooks/useProjects';
import { useIndicators } from '../hooks/useIndicators';
import ImpactChart from '../components/dashboard/ImpactChart';
import IndicatorProgressCard from '../components/indicators/IndicatorProgressCard';
import { format } from 'date-fns';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, deleteProject } = useProjects();
  const { indicators, loading: indicatorsLoading } = useIndicators(id);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        setLoading(true);
        const projectData = await getProjectById(id);
        setProject(projectData);
        setLoading(false);
      };
      
      fetchProject();
    }
  }, [id, getProjectById]);

  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      await deleteProject(project.id);
      navigate('/projects');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or has been removed.</p>
        <Link to="/projects" className="btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Environmental':
        return 'bg-green-100 text-green-800';
      case 'Social':
        return 'bg-blue-100 text-blue-800';
      case 'Governance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Mock data for charts
  const beneficiaryData = [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 120 },
    { month: 'Mar', value: 250 },
    { month: 'Apr', value: 320 },
    { month: 'May', value: 400 },
    { month: 'Jun', value: 520 },
    { month: 'Jul', value: 650 },
    { month: 'Aug', value: 780 },
  ];

  const budgetData = [
    { category: 'Staff', planned: 120000, actual: 115000 },
    { category: 'Equipment', planned: 80000, actual: 85000 },
    { category: 'Materials', planned: 50000, actual: 47500 },
    { category: 'Travel', planned: 30000, actual: 25000 },
    { category: 'Other', planned: 20000, actual: 18000 },
  ];

  return (
    <div>
      {/* Project Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900 mr-3">{project.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div className="mt-4 lg:mt-0 flex gap-2">
          <Link to={`/projects/${project.id}/edit`} className="btn-secondary">
            <Edit size={16} className="mr-1" />
            Edit
          </Link>
          <button onClick={handleDeleteProject} className="btn-error">
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Project Details */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">Timeline</span>
                </div>
                <p className="text-gray-900">
                  {format(new Date(project.start_date), 'MMM d, yyyy')}
                  {project.end_date && ` to ${format(new Date(project.end_date), 'MMM d, yyyy')}`}
                </p>
              </div>
              
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-gray-900">{project.location}</p>
              </div>
              
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Tag size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">Category</span>
                </div>
                <p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}>
                    {project.category}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <DollarSign size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">Budget</span>
                </div>
                <p className="text-gray-900">${project.budget.toLocaleString()}</p>
              </div>
              
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <User size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">Project Manager</span>
                </div>
                <p className="text-gray-900">{project.manager}</p>
              </div>
              
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Globe size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">SDGs</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.sdgs?.map(sdg => (
                    <div 
                      key={sdg}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-primary-50 text-primary-700"
                      title={`SDG ${sdg}`}
                    >
                      {sdg}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Impact Summary</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Completion</h3>
                <span className="text-lg font-semibold text-primary-600">65%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on timeline and milestones</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Budget Utilization</h3>
                <span className="text-lg font-semibold text-primary-600">58%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-500 rounded-full" style={{ width: '58%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total spent: ${(project.budget * 0.58).toLocaleString()}</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Impact Score</h3>
                <span className="text-lg font-semibold text-success-600">78</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-success-500 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on indicators performance</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Key Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Beneficiaries</span>
                  <span className="text-sm font-medium">780</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Activities Completed</span>
                  <span className="text-sm font-medium">12/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Indicators on track</span>
                  <span className="text-sm font-medium">
                    {indicators.filter(i => {
                      const current = i.current_value || 0;
                      const target = i.target_value || 0;
                      const ratio = current / target;
                      return ratio >= 0.5;
                    }).length}/{indicators.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ImpactChart 
          title="Beneficiaries Progress"
          type="line"
          data={beneficiaryData}
          dataKeys={[
            { key: 'value', color: '#2563EB', name: 'Beneficiaries' }
          ]}
          xAxisDataKey="month"
        />
        
        <ImpactChart 
          title="Budget Allocation"
          type="bar"
          data={budgetData}
          dataKeys={[
            { key: 'planned', color: '#64748B', name: 'Planned' },
            { key: 'actual', color: '#10B981', name: 'Actual' }
          ]}
          xAxisDataKey="category"
        />
      </div>

      {/* Impact Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Impact Indicators</h2>
          <Link to={`/indicators/new?projectId=${project.id}`} className="btn-primary btn-sm">
            <PlusCircle size={16} className="mr-1" />
            Add Indicator
          </Link>
        </div>
        
        {indicatorsLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : indicators.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="text-gray-400 mb-4">
              <BarChart3 size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No indicators yet</h3>
            <p className="text-gray-600 mb-4">
              Add indicators to track the impact of this project
            </p>
            <Link to={`/indicators/new?projectId=${project.id}`} className="btn-primary">
              Add First Indicator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicators.map(indicator => (
              <IndicatorProgressCard 
                key={indicator.id} 
                indicator={indicator}
                onClick={() => navigate(`/indicators/${indicator.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reports & Documents */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Reports & Documents</h2>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm">
              <FileText size={16} className="mr-1" />
              Generate Report
            </button>
            <button className="btn-primary btn-sm">
              <PlusCircle size={16} className="mr-1" />
              Upload
            </button>
          </div>
        </div>
        
        <div className="border rounded-md divide-y">
          {[
            { name: 'Project Proposal', type: 'PDF', date: '2023-05-10', size: '2.4 MB' },
            { name: 'Q2 Impact Report', type: 'PDF', date: '2023-07-15', size: '3.1 MB' },
            { name: 'Beneficiary Data', type: 'XLSX', date: '2023-08-20', size: '1.8 MB' },
            { name: 'Budget Allocation', type: 'XLSX', date: '2023-05-12', size: '0.9 MB' },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-md flex items-center justify-center ${
                  doc.type === 'PDF' ? 'bg-error-100 text-error-600' : 'bg-success-100 text-success-600'
                }`}>
                  <FileText size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {new Date(doc.date).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Activities Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3.5 top-0 h-full w-px bg-gray-200"></div>
          
          <div className="space-y-6">
            {[
              { title: 'Project Planning Phase', date: '2023-05-01', status: 'Completed', description: 'Defined project scope, objectives, and timeline.' },
              { title: 'Stakeholder Engagement', date: '2023-05-15', status: 'Completed', description: 'Conducted meetings with key stakeholders and community representatives.' },
              { title: 'Implementation: Phase 1', date: '2023-06-01', status: 'Completed', description: 'Started initial implementation activities in target communities.' },
              { title: 'Mid-term Assessment', date: '2023-07-15', status: 'Completed', description: 'Conducted evaluation of progress and made adjustments to approach.' },
              { title: 'Implementation: Phase 2', date: '2023-08-01', status: 'In Progress', description: 'Expanded implementation to additional communities.' },
              { title: 'Final Evaluation', date: '2023-11-15', status: 'Pending', description: 'Comprehensive assessment of project outcomes and impact.' },
            ].map((activity, index) => (
              <div key={index} className="relative pl-10">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1.5 h-7 w-7 rounded-full border-2 flex items-center justify-center ${
                  activity.status === 'Completed' 
                    ? 'bg-primary-100 border-primary-500' 
                    : activity.status === 'In Progress'
                      ? 'bg-warning-100 border-warning-500'
                      : 'bg-gray-100 border-gray-300'
                }`}>
                  {activity.status === 'Completed' && (
                    <div className="h-3 w-3 rounded-full bg-primary-500"></div>
                  )}
                </div>
                
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-medium text-gray-900">{activity.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      activity.status === 'Completed' 
                        ? 'bg-primary-100 text-primary-700' 
                        : activity.status === 'In Progress'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;