import { useState, useEffect } from 'react';
import { useIndicators } from '../hooks/useIndicators';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';

// Define interfaces matching the schema
interface Indicator {
  id: string;
  project_id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  target_value: number;
  current_value: number | null;
  start_value: number;
  sdg_goals: number[] | null;
  data_collection_method: string;
  frequency: string;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}

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

const Indicators = () => {
  const { indicators, loading: indicatorsLoading } = useIndicators();
  const { projects, loading: projectsLoading } = useProjects();
  const [projectIndicators, setProjectIndicators] = useState<any[]>([]);

  // Fetch project_indicators
  useEffect(() => {
    const fetchProjectIndicators = async () => {
      const { data, error } = await supabase
        .from('project_indicators')
        .select('*');
      if (error) {
        console.error('Error fetching project indicators:', error);
        return;
      }
      setProjectIndicators(data || []);
    };
    fetchProjectIndicators();

    // Real-time subscription for project_indicators
    const subscription = supabase
      .channel('project_indicators')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_indicators' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjectIndicators((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setProjectIndicators((prev) =>
            prev.map((ind) => (ind.id === payload.new.id ? payload.new : ind))
          );
        } else if (payload.eventType === 'DELETE') {
          setProjectIndicators((prev) => prev.filter((ind) => ind.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (indicatorsLoading || projectsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Indicators</h1>

      {/* Indicators Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Indicator Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Project</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Current Value</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((indicator) => {
                const project = projects.find((p) => p.id === indicator.project_id);
                return (
                  <tr key={indicator.id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {project ? project.name : 'Unknown Project'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.category}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.current_value ?? 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Indicators Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Indicators</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Indicator Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Project</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Value</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit</th>
              </tr>
            </thead>
            <tbody>
              {projectIndicators.map((indicator) => {
                const project = projects.find((p) => p.id === indicator.project_id);
                return (
                  <tr key={indicator.id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {project ? project.name : 'Unknown Project'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.category}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.value}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{indicator.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Indicators;