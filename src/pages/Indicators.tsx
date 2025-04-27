import { useState, useEffect } from 'react';
import { useIndicators } from '../hooks/useIndicators';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { Tables, Enums } from '../types/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define interface matching the project_indicators schema
interface Indicator extends Tables<"project_indicators"> {}

// Since useIndicators might return indicators from the indicators table, define its type separately
type KPIIndicator = Tables<"indicators">;

// Define the form state for creating a new indicator
interface NewIndicatorForm {
  type: 'project_indicators' | 'indicators';
  name: string;
  project_id: string;
  category: string | Enums<"indicator_category">;
  unit: string;
  value?: number; // For project_indicators
  current_value?: number | null; // For indicators
  description?: string | null; // For indicators
  target_value?: number | null; // For indicators
  start_value?: number | null; // For indicators
  sdg_goals?: number[] | null; // For indicators
  data_collection_method?: string | null; // For indicators
  frequency?: Enums<"measurement_frequency"> | null; // For indicators
}

// Mock function to simulate fetching historical data
const fetchHistoricalData = async (indicatorId: string | number) => {
  // Replace this with your actual data fetching logic
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
  const randomData = Array.from({ length: 5 }, (_, i) => ({
    date: `2025-04-${20 + i}`,
    value: Math.floor(Math.random() * 100),
  }));
  return randomData;
};

const Indicators = () => {
  const { indicators: kpiIndicators, loading: indicatorsLoading } = useIndicators();
  const { projects, loading: projectsLoading } = useProjects();
  const [projectIndicators, setProjectIndicators] = useState<Indicator[]>([]);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | KPIIndicator | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newIndicator, setNewIndicator] = useState<NewIndicatorForm>({
    type: 'project_indicators',
    name: '',
    project_id: '',
    category: '',
    unit: '',
    value: 0,
    current_value: null,
    description: '',
    target_value: null,
    start_value: null,
    sdg_goals: [],
    data_collection_method: '',
    frequency: null,
  });
  const [historicalData, setHistoricalData] = useState<{ [indicatorId: string]: { date: string; value: number }[] }>({});

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
      // Filter out indicators with null project_id
      setProjectIndicators((data || []).filter((ind: Indicator) => ind.project_id !== null));
    };
    fetchProjectIndicators();

    // Real-time subscription for project_indicators
    const subscription = supabase
      .channel('project_indicators')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_indicators' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newIndicator = payload.new as Indicator;
          if (newIndicator.project_id !== null) {
            setProjectIndicators((prev) => [...prev, newIndicator]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedIndicator = payload.new as Indicator;
          if (updatedIndicator.project_id !== null) {
            setProjectIndicators((prev) =>
              prev.map((ind) => (ind.id === updatedIndicator.id ? updatedIndicator : ind))
            );
          } else {
            setProjectIndicators((prev) => prev.filter((ind) => ind.id !== updatedIndicator.id));
          }
        } else if (payload.eventType === 'DELETE') {
          setProjectIndicators((prev) => prev.filter((ind) => ind.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Fetch historical data for indicators
  useEffect(() => {
    const fetchData = async () => {
      const kpiData: { [indicatorId: string]: { date: string; value: number }[] } = {};
      for (const indicator of kpiIndicators) {
        const data = await fetchHistoricalData(indicator.id);
        kpiData[indicator.id] = data;
      }
      setHistoricalData(kpiData);
    };

    if (kpiIndicators.length > 0) {
      fetchData();
    }
  }, [kpiIndicators]);

  // Handle editing an indicator
  const handleEdit = (indicator: Indicator | KPIIndicator) => {
    setEditingIndicator(indicator);
    setIsEditModalOpen(true);
  };

  // Handle updating an indicator
  const handleUpdate = async () => {
    if (!editingIndicator) return;

    // Check if editingIndicator is from project_indicators or indicators
    const isProjectIndicator = 'value' in editingIndicator;

    const { error } = await supabase
      .from(isProjectIndicator ? 'project_indicators' : 'indicators')
      .update(
        isProjectIndicator
          ? {
              name: editingIndicator.name,
              category: editingIndicator.category,
              unit: editingIndicator.unit,
              value: (editingIndicator as Indicator).value,
              updated_at: new Date().toISOString(),
            }
          : {
              name: editingIndicator.name,
              description: (editingIndicator as KPIIndicator).description,
              category: (editingIndicator as KPIIndicator).category,
              unit: editingIndicator.unit,
              target_value: (editingIndicator as KPIIndicator).target_value,
              current_value: (editingIndicator as KPIIndicator).current_value,
              start_value: (editingIndicator as KPIIndicator).start_value,
              sdg_goals: (editingIndicator as KPIIndicator).sdg_goals,
              data_collection_method: (editingIndicator as KPIIndicator).data_collection_method,
              frequency: (editingIndicator as KPIIndicator).frequency,
              updated_at: new Date().toISOString(),
            }
      )
      .eq('id', editingIndicator.id);

    if (error) {
      console.error('Error updating indicator:', error);
      alert('Failed to update indicator');
      return;
    }

    alert('Indicator updated successfully');
    setIsEditModalOpen(false);
    setEditingIndicator(null);
  };

  // Handle creating a new indicator
  const handleCreate = async () => {
    // Validate required fields
    if (!newIndicator.name) {
      alert('Name is required');
      return;
    }
    if (!newIndicator.project_id) {
      alert('Project is required');
      return;
    }
    if (!newIndicator.unit) {
      alert('Unit is required');
      return;
    }
    if (!newIndicator.category) {
      alert('Category is required');
      return;
    }

    if (newIndicator.type === 'project_indicators') {
      const { error } = await supabase.from('project_indicators').insert({
        name: newIndicator.name,
        project_id: newIndicator.project_id,
        category: newIndicator.category as string,
        unit: newIndicator.unit,
        value: newIndicator.value ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating project indicator:', error);
        alert('Failed to create project indicator');
        return;
      }
    } else {
      // Validate additional required fields for indicators
      if (!newIndicator.start_value && newIndicator.start_value !== 0) {
        alert('Start Value is required for Key Performance Indicators');
        return;
      }
      if (!newIndicator.data_collection_method) {
        alert('Data Collection Method is required for Key Performance Indicators');
        return;
      }
      if (!newIndicator.frequency) {
        alert('Frequency is required for Key Performance Indicators');
        return;
      }

      const { error } = await supabase.from('indicators').insert({
        name: newIndicator.name,
        project_id: newIndicator.project_id,
        category: newIndicator.category as Enums<"indicator_category">,
        unit: newIndicator.unit,
        description: newIndicator.description || null,
        target_value: newIndicator.target_value,
        current_value: newIndicator.current_value,
        start_value: newIndicator.start_value,
        sdg_goals: newIndicator.sdg_goals?.length ? newIndicator.sdg_goals : null,
        data_collection_method: newIndicator.data_collection_method,
        frequency: newIndicator.frequency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating indicator:', error);
        alert('Failed to create indicator');
        return;
      }
    }

    alert('Indicator created successfully');
    setIsCreateModalOpen(false);
    setNewIndicator({
      type: 'project_indicators',
      name: '',
      project_id: '',
      category: '',
      unit: '',
      value: 0,
      current_value: null,
      description: '',
      target_value: null,
      start_value: null,
      sdg_goals: [],
      data_collection_method: '',
      frequency: null,
    });
  };

  if (indicatorsLoading || projectsLoading) {
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
            Indicators
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Create Indicator
          </button>
        </div>

        {/* Key Performance Indicators Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiIndicators
              .filter((indicator) => indicator.project_id !== null)
              .map((indicator) => {
                const project = projects.find((p) => p.id === indicator.project_id);
                const progress = indicator.target_value !== null && indicator.target_value > 0
                  ? Math.min(((indicator.current_value ?? 0) / indicator.target_value) * 100, 100)
                  : 0;

                // Chart data
                const chartData = {
                  labels: historicalData[indicator.id]?.map((data) => data.date) || [],
                  datasets: [
                    {
                      label: 'Value',
                      data: historicalData[indicator.id]?.map((data) => data.value) || [],
                      fill: false,
                      backgroundColor: 'rgb(75, 192, 192)',
                      borderColor: 'rgba(75, 192, 192, 0.2)',
                    },
                  ],
                };

                const chartOptions = {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                };

                return (
                  <div
                    key={indicator.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {indicator.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {indicator.description || 'No description available.'}
                      </p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Value: {indicator.current_value ?? 0} {indicator.target_value !== null ? `/ ${indicator.target_value}` : ''} {indicator.unit}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              progress >= 75
                                ? 'bg-green-500'
                                : progress >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      {/* Chart */}
                      <div style={{ height: '200px' }}>
                        <Line data={chartData} options={chartOptions} />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            indicator.category === 'Quantitative'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}
                        >
                          {indicator.category}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p>
                          <span className="font-medium">Project:</span>{' '}
                          {project ? project.name : 'Unknown Project'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEdit(indicator)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        Edit Indicator
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Project Indicators Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Project Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectIndicators.map((indicator) => {
              const project = projects.find((p) => p.id === indicator.project_id);
              const progress = Math.min(indicator.value ?? 0, 100);

              // Chart data
              const chartData = {
                labels: historicalData[indicator.id]?.map((data) => data.date) || [],
                datasets: [
                  {
                    label: 'Value',
                    data: historicalData[indicator.id]?.map((data) => data.value) || [],
                    fill: false,
                    backgroundColor: 'rgb(75, 192, 192)',
                    borderColor: 'rgba(75, 192, 192, 0.2)',
                  },
                ],
              };

              const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              };

              return (
                <div
                  key={indicator.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {indicator.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {'No description available.'}
                    </p>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Value: {indicator.value ?? 0} {indicator.unit}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            progress >= 75
                              ? 'bg-green-500'
                              : progress >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={progress ? { width: `${progress}%` } : { width: '0%' }}
                        ></div>
                      </div>
                    </div>
                    {/* Chart */}
                    <div style={{ height: '200px' }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          indicator.category.toLowerCase().includes('quantitative')
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                      >
                        {indicator.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <p>
                        <span className="font-medium">Project:</span>{' '}
                        {project ? project.name : 'Unknown Project'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(indicator)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      Edit Indicator
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Indicator Modal */}
        {isEditModalOpen && editingIndicator && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-lg w-full mx-4 my-8 shadow-2xl transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Edit Indicator
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingIndicator.name}
                    onChange={(e) =>
                      setEditingIndicator({ ...editingIndicator, name: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                {'description' in editingIndicator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={(editingIndicator as KPIIndicator).description || ''}
                      onChange={(e) =>
                        setEditingIndicator({ ...editingIndicator, description: e.target.value })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      rows={3}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  {'value' in editingIndicator ? (
                    <input
                      type="text"
                      value={editingIndicator.category}
                      onChange={(e) =>
                        setEditingIndicator({ ...editingIndicator, category: e.target.value })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  ) : (
                    <select
                      value={(editingIndicator as KPIIndicator).category}
                      onChange={(e) =>
                        setEditingIndicator({
                          ...editingIndicator,
                          category: e.target.value as Enums<"indicator_category">,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    >
                      <option value="Quantitative">Quantitative</option>
                      <option value="Qualitative">Qualitative</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={editingIndicator.unit}
                    onChange={(e) =>
                      setEditingIndicator({ ...editingIndicator, unit: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                {'target_value' in editingIndicator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={(editingIndicator as KPIIndicator).target_value ?? ''}
                      onChange={(e) =>
                        setEditingIndicator({
                          ...editingIndicator,
                          target_value: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={
                      'value' in editingIndicator
                        ? (editingIndicator as Indicator).value ?? ''
                        : (editingIndicator as KPIIndicator).current_value ?? ''
                    }
                    onChange={(e) => {
                      const newValue = e.target.value ? parseInt(e.target.value) : null;
                      if ('value' in editingIndicator) {
                        setEditingIndicator({
                          ...editingIndicator,
                          value: newValue ?? 0,
                        });
                      } else {
                        setEditingIndicator({
                          ...editingIndicator,
                          current_value: newValue,
                        });
                      }
                    }}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                {'start_value' in editingIndicator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Value
                    </label>
                    <input
                      type="number"
                      value={(editingIndicator as KPIIndicator).start_value ?? ''}
                      onChange={(e) =>
                        setEditingIndicator({
                          ...editingIndicator,
                          start_value: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                {'sdg_goals' in editingIndicator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SDG Goals
                    </label>
                    <input
                      type="text"
                      value={(editingIndicator as KPIIndicator).sdg_goals?.join(', ') || ''}
                      onChange={(e) =>
                        setEditingIndicator({
                          ...editingIndicator,
                          sdg_goals: e.target.value
                            .split(',')
                            .map((s) => parseInt(s.trim()))
                            .filter((n) => !isNaN(n)),
                        })
                      }
                      placeholder="e.g., 7, 13"
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                {'data_collection_method' in editingIndicator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Collection Method
                    </label>
                    <input
                      type="text"
                      value={(editingIndicator as KPIIndicator).data_collection_method || ''}
                      onChange={(e) =>
                        setEditingIndicator({
                          ...editingIndicator,
                          data_collection_method: e.target.value,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                {'frequency' in editingIndicator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <select
                      value={(editingIndicator as KPIIndicator).frequency || ''}
                      onChange={(e) =>
                        setEditingIndicator({
                          ...editingIndicator,
                          frequency: e.target.value as Enums<"measurement_frequency">,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    >
                      <option value="">Select Frequency</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>
                )}
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

        {/* Create Indicator Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-lg w-full mx-4 my-8 shadow-2xl transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Create Indicator
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Indicator Type
                  </label>
                  <select
                    value={newIndicator.type}
                    onChange={(e) => {
                      const type = e.target.value as 'project_indicators' | 'indicators';
                      setNewIndicator({
                        ...newIndicator,
                        type,
                        category: type === 'project_indicators' ? '' : 'Quantitative',
                        frequency: type === 'project_indicators' ? null : 'Daily',
                      });
                    }}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="project_indicators">Project Indicator</option>
                    <option value="indicators">Key Performance Indicator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project
                  </label>
                  <select
                    value={newIndicator.project_id}
                    onChange={(e) =>
                      setNewIndicator({ ...newIndicator, project_id: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="">Select a Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newIndicator.name}
                    onChange={(e) =>
                      setNewIndicator({ ...newIndicator, name: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                {newIndicator.type === 'indicators' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newIndicator.description || ''}
                      onChange={(e) =>
                        setNewIndicator({ ...newIndicator, description: e.target.value })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      rows={3}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  {newIndicator.type === 'project_indicators' ? (
                    <input
                      type="text"
                      value={newIndicator.category}
                      onChange={(e) =>
                        setNewIndicator({ ...newIndicator, category: e.target.value })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  ) : (
                    <select
                      value={newIndicator.category}
                      onChange={(e) =>
                        setNewIndicator({
                          ...newIndicator,
                          category: e.target.value as Enums<"indicator_category">,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    >
                      <option value="Quantitative">Quantitative</option>
                      <option value="Qualitative">Qualitative</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newIndicator.unit}
                    onChange={(e) =>
                      setNewIndicator({ ...newIndicator, unit: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                {newIndicator.type === 'indicators' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={newIndicator.target_value ?? ''}
                      onChange={(e) =>
                        setNewIndicator({
                          ...newIndicator,
                          target_value: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={
                      newIndicator.type === 'project_indicators'
                        ? newIndicator.value ?? ''
                        : newIndicator.current_value ?? ''
                    }
                    onChange={(e) => {
                      const newValue = e.target.value ? parseInt(e.target.value) : null;
                      if (newIndicator.type === 'project_indicators') {
                        setNewIndicator({
                          ...newIndicator,
                          value: newValue ?? 0,
                        });
                      } else {
                        setNewIndicator({
                          ...newIndicator,
                          current_value: newValue,
                        });
                      }
                    }}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
                {newIndicator.type === 'indicators' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Value
                    </label>
                    <input
                      type="number"
                      value={newIndicator.start_value ?? ''}
                      onChange={(e) =>
                        setNewIndicator({
                          ...newIndicator,
                          start_value: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                {newIndicator.type === 'indicators' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SDG Goals
                    </label>
                    <input
                      type="text"
                      value={newIndicator.sdg_goals?.join(', ') || ''}
                      onChange={(e) =>
                        setNewIndicator({
                          ...newIndicator,
                          sdg_goals: e.target.value
                            .split(',')
                            .map((s) => parseInt(s.trim()))
                            .filter((n) => !isNaN(n)),
                        })
                      }
                      placeholder="e.g., 7, 13"
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                {newIndicator.type === 'indicators' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Collection Method
                    </label>
                    <input
                      type="text"
                      value={newIndicator.data_collection_method || ''}
                      onChange={(e) =>
                        setNewIndicator({
                          ...newIndicator,
                          data_collection_method: e.target.value,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>
                )}
                {newIndicator.type === 'indicators' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <select
                      value={newIndicator.frequency || ''}
                      onChange={(e) =>
                        setNewIndicator({
                          ...newIndicator,
                          frequency: e.target.value as Enums<"measurement_frequency">,
                        })
                      }
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    >
                      <option value="">Select Frequency</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>
                )}
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

export default Indicators;