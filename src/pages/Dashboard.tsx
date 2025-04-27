import { useState, useEffect } from 'react';
import { Users, BarChart3, Landmark, TrendingUp, Globe } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ImpactChart from '../components/dashboard/ImpactChart';
import { useProjects } from '../hooks/useProjects';
import { useIndicators } from '../hooks/useIndicators';
import { supabase } from '../lib/supabase';

// Define interfaces matching the updated schema
interface Project {
  id: string;
  name: string;
  description: string | null;
  location: string;
  category: string;
  status: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  manager: string;
  sdgs: number[] | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Indicator {
  id: string;
  project_id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  target_value: number;
  current_value: number | null; // Updated to allow null
  start_value: number;
  sdg_goals: number[] | null;
  data_collection_method: string;
  frequency: string;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}

interface ProjectSDG {
  id: string;
  project_id: string;
  sdg_number: number;
  contribution_level: 'direct' | 'indirect';
  description: string;
  created_at: string;
  created_by: string;
}

// Define ChartData type to match ImpactChart expectations
interface ChartData {
  name: string;
  [key: string]: string | number;
}

const Dashboard = () => {
  const { projects } = useProjects();
  const { indicators } = useIndicators();
  const [projectSDGs, setProjectSDGs] = useState<ProjectSDG[]>([]);

  // Currency formatter for IDR
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  // Fetch project_sdgs
  useEffect(() => {
    const fetchProjectSDGs = async () => {
      const { data, error } = await supabase
        .from('project_sdgs')
        .select('*');
      if (error) {
        console.error('Error fetching project SDGs:', error);
        return;
      }
      setProjectSDGs(data || []);
    };
    fetchProjectSDGs();

    // Real-time subscription for project_sdgs
    const subscription = supabase
      .channel('project_sdgs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_sdgs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjectSDGs((prev) => [...prev, payload.new as ProjectSDG]);
        } else if (payload.eventType === 'UPDATE') {
          setProjectSDGs((prev) =>
            prev.map((sdg) => (sdg.id === payload.new.id ? (payload.new as ProjectSDG) : sdg))
          );
        } else if (payload.eventType === 'DELETE') {
          setProjectSDGs((prev) => prev.filter((sdg) => sdg.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Calculate Beneficiaries Growth (using current_value for indicators related to people)
  const beneficiaryData: ChartData[] = indicators
    .filter(ind => ind.unit === 'people' || ind.name.toLowerCase().includes('beneficiaries'))
    .map((ind, idx) => ({
      name: `Data ${idx + 1}`,
      beneficiaries: ind.current_value ?? 0, // Fallback to 0 if null
    }));

  // Calculate SDG Progress (based on project_sdgs)
  const sdgData: ChartData[] = projectSDGs.reduce((acc, sdg) => {
    const existing = acc.find(item => item.name === `SDG ${sdg.sdg_number}`);
    if (existing) {
      existing.progress = (Number(existing.progress) || 0) + (sdg.contribution_level === 'direct' ? 50 : 25);
    } else {
      acc.push({
        name: `SDG ${sdg.sdg_number}`,
        progress: sdg.contribution_level === 'direct' ? 50 : 25,
      });
    }
    return acc;
  }, [] as ChartData[]);

  const projectStatus: ChartData[] = [
    { name: 'Planning', value: projects?.filter(p => p.status === 'Planning').length || 0 },
    { name: 'Active', value: projects?.filter(p => p.status === 'Active').length || 0 },
    { name: 'Completed', value: projects?.filter(p => p.status === 'Completed').length || 0 },
    { name: 'Cancelled', value: projects?.filter(p => p.status === 'Cancelled').length || 0 },
  ];

  // Calculate ESG Distribution data
  const esgData: ChartData[] = [
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

  // Calculate total beneficiaries from indicators
  const totalBeneficiaries = indicators
    .filter(ind => ind.unit === 'people' || ind.name.toLowerCase().includes('beneficiaries'))
    .reduce((sum, ind) => sum + (ind.current_value ?? 0), 0);

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
          value={totalBeneficiaries.toLocaleString()} 
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
          value={formatCurrency(projects?.reduce((sum, p) => sum + p.budget, 0) || 0)} 
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
            {indicators.slice(0, 4).map((indicator, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mr-3">
                  <Globe size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    {projects.find(p => p.id === indicator.project_id)?.name || 'Unknown Project'} updated {indicator.name} to {indicator.current_value ?? 0} {indicator.unit}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(indicator.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Reports</h3>
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-800">{project.name} Report</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {new Date(project.end_date || Date.now()).toLocaleDateString()} • {project.name}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  project.status === 'Active' ? 'bg-warning-100 text-warning-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'Active' ? 'Due Soon' : 'Upcoming'}
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