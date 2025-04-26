import React from 'react';
import { Users, BarChart3, Landmark, TrendingUp, Globe, FileText } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ImpactChart from '../components/dashboard/ImpactChart';
import { useProjects } from '../hooks/useProjects';
import { useIndicators } from '../hooks/useIndicators';

const Dashboard = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { indicators, loading: indicatorsLoading } = useIndicators();

  const beneficiaryData = [
    { name: 'Jan', beneficiaries: 2400 },
    { name: 'Feb', beneficiaries: 2800 },
    { name: 'Mar', beneficiaries: 3200 },
    { name: 'Apr', beneficiaries: 4000 },
    { name: 'May', beneficiaries: 4500 },
    { name: 'Jun', beneficiaries: 4800 },
    { name: 'Jul', beneficiaries: 5200 },
    { name: 'Aug', beneficiaries: 5800 },
  ];

  const sdgData = [
    { name: 'SDG 1', progress: 45 },
    { name: 'SDG 2', progress: 65 },
    { name: 'SDG 3', progress: 80 },
    { name: 'SDG 4', progress: 72 },
    { name: 'SDG 5', progress: 50 },
    { name: 'SDG 6', progress: 90 },
    { name: 'SDG 7', progress: 30 },
  ];

  const projectStatus = [
    { name: 'Planning', value: projects?.filter(p => p.status === 'Planning').length || 0 },
    { name: 'Active', value: projects?.filter(p => p.status === 'Active').length || 0 },
    { name: 'Completed', value: projects?.filter(p => p.status === 'Completed').length || 0 },
    { name: 'Cancelled', value: projects?.filter(p => p.status === 'Cancelled').length || 0 },
  ];

  // Calculate ESG Distribution data
  const esgData = [
    { 
      name: 'Environmental', 
      projects: projects?.filter(p => p.category === 'Environmental').length || 0,
      indicators: indicators?.filter(i => 
        projects?.find(p => p.id === i.project_id)?.category === 'Environmental'
      ).length || 0
    },
    { 
      name: 'Social', 
      projects: projects?.filter(p => p.category === 'Social').length || 0,
      indicators: indicators?.filter(i => 
        projects?.find(p => p.id === i.project_id)?.category === 'Social'
      ).length || 0
    },
    { 
      name: 'Governance', 
      projects: projects?.filter(p => p.category === 'Governance').length || 0,
      indicators: indicators?.filter(i => 
        projects?.find(p => p.id === i.project_id)?.category === 'Governance'
      ).length || 0
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Social Impact Dashboard</h1>
        <p className="mt-1 text-gray-600">Overview of your organization's impact initiatives</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Beneficiaries" 
          value="5,825" 
          change={12}
          icon={<Users size={20} />}
          variant="primary"
        />
        <StatCard 
          title="Active Projects" 
          value={projects?.filter(p => p.status === 'Active').length || 0} 
          change={0}
          icon={<BarChart3 size={20} />}
          variant="secondary"
        />
        <StatCard 
          title="Impact Budget" 
          value={`$${(projects?.reduce((sum, p) => sum + p.budget, 0) || 0).toLocaleString()}`} 
          change={5}
          icon={<Landmark size={20} />}
          variant="accent"
        />
        <StatCard 
          title="ESG Score" 
          value="78/100" 
          change={3}
          icon={<TrendingUp size={20} />}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ImpactChart 
          title="Beneficiaries Growth"
          type="line"
          data={beneficiaryData}
          dataKeys={[
            { key: 'beneficiaries', color: '#2563EB', name: 'Total Beneficiaries' }
          ]}
          yAxisLabel="People"
        />
        <ImpactChart 
          title="SDG Progress"
          type="bar"
          data={sdgData}
          dataKeys={[
            { key: 'progress', color: '#10B981', name: 'Progress (%)' }
          ]}
          yAxisLabel="%"
        />
      </div>

      {/* Project Status and ESG Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ImpactChart 
          title="Project Status"
          type="bar"
          data={projectStatus}
          dataKeys={[
            { key: 'value', color: '#6366F1', name: 'Projects' }
          ]}
        />
        <ImpactChart 
          title="ESG Distribution"
          type="bar"
          data={esgData}
          dataKeys={[
            { key: 'projects', color: '#F59E0B', name: 'Projects' },
            { key: 'indicators', color: '#10B981', name: 'Indicators' }
          ]}
        />
      </div>

      {/* Recent Activity and Pending Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { icon: <Globe size={16} />, text: 'Clean Water Initiative added 200 new beneficiaries', time: '2 hours ago' },
              { icon: <BarChart3 size={16} />, text: 'CO2 Reduction target updated to 12,000 metric tons', time: '1 day ago' },
              { icon: <Users size={16} />, text: 'Youth Education Program completed quarterly assessment', time: '2 days ago' },
              { icon: <FileText size={16} />, text: 'New impact report generated for Sustainable Agriculture', time: '3 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mr-3">
                  {activity.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Reports</h3>
          <div className="space-y-3">
            {[
              { name: 'Q3 Impact Summary', due: 'Sep 30, 2023', project: 'Clean Water Initiative', status: 'Urgent' },
              { name: 'Monthly Progress Report', due: 'Sep 15, 2023', project: 'Youth Education Program', status: 'Due Soon' },
              { name: 'ESG Compliance Report', due: 'Oct 10, 2023', project: 'All Projects', status: 'Upcoming' },
              { name: 'Beneficiary Feedback Summary', due: 'Oct 15, 2023', project: 'Community Health Outreach', status: 'Upcoming' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-800">{report.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {report.due} • {report.project}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  report.status === 'Urgent' 
                    ? 'bg-error-100 text-error-800' 
                    : report.status === 'Due Soon' 
                      ? 'bg-warning-100 text-warning-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;