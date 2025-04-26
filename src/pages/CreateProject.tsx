import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Define ProjectFormData interface
interface ProjectFormData {
  name: string;
  description: string | null;
  location: string;
  category: 'Environmental' | 'Social' | 'Governance';
  start_date: string;
  end_date: string | null;
  budget: number;
  manager: string;
  sdgs: number[];
  status?: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  created_by?: string | null;
}

// Define IndicatorFormData interface
interface IndicatorFormData {
  name: string;
  value: number;
  unit: string;
  category: 'Environmental' | 'Social' | 'Governance';
}

// Default CSR indicators
const defaultIndicators: IndicatorFormData[] = [
  { name: 'Carbon Emissions Reduced', value: 0, unit: 'tons CO2e', category: 'Environmental' },
  { name: 'Energy Consumption', value: 0, unit: 'kWh', category: 'Environmental' },
  { name: 'Water Usage', value: 0, unit: 'liters', category: 'Environmental' },
  { name: 'Jobs Created', value: 0, unit: 'jobs', category: 'Social' },
  { name: 'Training Hours Provided', value: 0, unit: 'hours', category: 'Social' },
  { name: 'Compliance Rate', value: 0, unit: '%', category: 'Governance' },
];

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expandedIndicator, setExpandedIndicator] = useState<number | null>(null);

  const initialFormData: ProjectFormData = {
    name: '',
    description: '',
    location: '',
    category: 'Environmental',
    start_date: '',
    end_date: null,
    budget: 0,
    manager: '',
    sdgs: [],
    status: 'Planning',
    created_by: user?.id || null,
  };

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [indicators, setIndicators] = useState<IndicatorFormData[]>(defaultIndicators);

  const validateForm = (data: ProjectFormData, indicators: IndicatorFormData[]) => {
    if (!data.name) return 'Project name is required';
    if (!data.location) return 'Location is required';
    if (!data.start_date) return 'Start date is required';
    if (!data.manager) return 'Project manager is required';
    if (data.budget < 0) return 'Budget cannot be negative';
    if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
      return 'End date cannot be before start date';
    }
    if (data.sdgs.some(sdg => sdg < 1 || sdg > 17)) {
      return 'SDGs must be between 1 and 17';
    }
    if (indicators.length === 0) return 'At least one indicator is required';
    for (const indicator of indicators) {
      if (!indicator.name) return 'Indicator name is required';
      if (indicator.value < 0) return 'Indicator value cannot be negative';
      if (!indicator.unit) return 'Indicator unit is required';
    }
    return null;
  };

  const addIndicator = () => {
    setIndicators([...indicators, { name: '', value: 0, unit: '', category: 'Environmental' }]);
    setExpandedIndicator(indicators.length);
  };

  const updateIndicator = (index: number, field: keyof IndicatorFormData, value: any) => {
    const updatedIndicators = indicators.map((indicator, i) =>
      i === index ? { ...indicator, [field]: value } : indicator
    );
    setIndicators(updatedIndicators);
  };

  const removeIndicator = (index: number) => {
    setIndicators(indicators.filter((_, i) => i !== index));
    if (expandedIndicator === index) setExpandedIndicator(null);
  };

  const toggleIndicator = (index: number) => {
    setExpandedIndicator(expandedIndicator === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!user) {
      setError('You must be logged in to create a project');
      setLoading(false);
      return;
    }

    const validationError = validateForm(formData, indicators);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const projectData: ProjectFormData = {
        ...formData,
        created_by: user.id,
        status: formData.status || 'Planning',
      };

      const { data: projectResult, error: projectError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (projectError) {
        console.error('Supabase project error:', projectError);
        throw new Error(projectError.message);
      }

      const indicatorData = indicators.map(indicator => ({
        project_id: projectResult.id,
        name: indicator.name,
        value: indicator.value,
        unit: indicator.unit,
        category: indicator.category,
      }));

      const { error: indicatorError } = await supabase
        .from('project_indicators')
        .insert(indicatorData);

      if (indicatorError) {
        console.error('Supabase indicator error:', indicatorError);
        throw new Error(indicatorError.message);
      }

      setSuccess(true);
      setTimeout(() => navigate('/projects'), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the project';
      console.error('Error details:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center sm:text-left">Create New Project</h1>

        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-slide-in">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 animate-slide-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>Project created successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Details</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectFormData['category'] })}
                    aria-required="true"
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    id="location"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Project Manager</label>
                  <input
                    type="text"
                    id="manager"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    id="start_date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                  <input
                    type="date"
                    id="end_date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                  />
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
                  <input
                    type="number"
                    id="budget"
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="sdgs" className="block text-sm font-medium text-gray-700">SDGs (comma-separated, 1-17)</label>
                  <input
                    type="text"
                    id="sdgs"
                    placeholder="e.g., 1,3,7"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.sdgs.join(',')}
                    onChange={(e) => {
                      const sdgs = e.target.value
                        .split(',')
                        .map(s => Number(s.trim()))
                        .filter(s => !isNaN(s));
                      setFormData({ ...formData, sdgs });
                    }}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  />
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">CSR Indicators</h2>
                <button
                  type="button"
                  onClick={addIndicator}
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition duration-150 ease-in-out"
                >
                  <Plus className="w-5 h-5" />
                  Add Indicator
                </button>
              </div>

              {indicators.length === 0 ? (
                <p className="text-gray-500">No indicators added. Click "Add Indicator" to start.</p>
              ) : (
                indicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleIndicator(index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      <span className="font-medium text-gray-800">
                        {indicator.name || `Indicator ${index + 1}`}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {indicator.value} {indicator.unit}
                        </span>
                        {expandedIndicator === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </button>

                    {expandedIndicator === index && (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor={`indicator-name-${index}`} className="block text-sm font-medium text-gray-700">
                              Name
                            </label>
                            <input
                              type="text"
                              id={`indicator-name-${index}`}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                              value={indicator.name}
                              onChange={(e) => updateIndicator(index, 'name', e.target.value)}
                              aria-required="true"
                            />
                          </div>

                          <div>
                            <label htmlFor={`indicator-value-${index}`} className="block text-sm font-medium text-gray-700">
                              Value
                            </label>
                            <input
                              type="number"
                              id={`indicator-value-${index}`}
                              required
                              min="0"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                              value={indicator.value}
                              onChange={(e) => updateIndicator(index, 'value', Number(e.target.value))}
                              aria-required="true"
                            />
                          </div>

                          <div>
                            <label htmlFor={`indicator-unit-${index}`} className="block text-sm font-medium text-gray-700">
                              Unit
                            </label>
                            <input
                              type="text"
                              id={`indicator-unit-${index}`}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                              value={indicator.unit}
                              onChange={(e) => updateIndicator(index, 'unit', e.target.value)}
                              aria-required="true"
                            />
                          </div>

                          <div>
                            <label htmlFor={`indicator-category-${index}`} className="block text-sm font-medium text-gray-700">
                              Category
                            </label>
                            <select
                              id={`indicator-category-${index}`}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-150 ease-in-out"
                              value={indicator.category}
                              onChange={(e) => updateIndicator(index, 'category', e.target.value as IndicatorFormData['category'])}
                              aria-required="true"
                            >
                              <option value="Environmental">Environmental</option>
                              <option value="Social">Social</option>
                              <option value="Governance">Governance</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeIndicator(index)}
                          className="mt-4 flex items-center gap-2 text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                        >
                          <Trash2 className="w-5 h-5" />
                          Remove Indicator
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white transition duration-150 ease-in-out ${
                  loading
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tailwind Animation for Slide-In */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}