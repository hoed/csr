import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Indicator } from '../../hooks/useIndicators';

interface IndicatorFormProps {
  projectId: string;
  onSubmit: (data: any) => void;
  defaultValues?: Partial<Indicator>;
  isSubmitting?: boolean;
}

const SDG_OPTIONS = [
  { value: 1, label: 'SDG 1: No Poverty' },
  { value: 2, label: 'SDG 2: Zero Hunger' },
  { value: 3, label: 'SDG 3: Good Health and Well-being' },
  { value: 4, label: 'SDG 4: Quality Education' },
  { value: 5, label: 'SDG 5: Gender Equality' },
  { value: 6, label: 'SDG 6: Clean Water and Sanitation' },
  { value: 7, label: 'SDG 7: Affordable and Clean Energy' },
  { value: 8, label: 'SDG 8: Decent Work and Economic Growth' },
  { value: 9, label: 'SDG 9: Industry, Innovation and Infrastructure' },
  { value: 10, label: 'SDG 10: Reduced Inequality' },
  { value: 11, label: 'SDG 11: Sustainable Cities and Communities' },
  { value: 12, label: 'SDG 12: Responsible Consumption and Production' },
  { value: 13, label: 'SDG 13: Climate Action' },
  { value: 14, label: 'SDG 14: Life Below Water' },
  { value: 15, label: 'SDG 15: Life on Land' },
  { value: 16, label: 'SDG 16: Peace, Justice and Strong Institutions' },
  { value: 17, label: 'SDG 17: Partnerships for the Goals' }
];

const IndicatorForm: React.FC<IndicatorFormProps> = ({ 
  projectId, 
  onSubmit, 
  defaultValues,
  isSubmitting = false
}) => {
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      project_id: projectId,
      name: '',
      description: '',
      category: 'Quantitative',
      unit: '',
      target_value: null,
      current_value: null,
      start_value: null,
      sdg_goals: [],
      data_collection_method: '',
      frequency: 'Monthly',
      ...defaultValues
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-control">
        <label htmlFor="name" className="form-label">Indicator Name*</label>
        <input
          id="name"
          type="text"
          className={`form-input ${errors.name ? 'border-error-500' : ''}`}
          placeholder="e.g., Number of beneficiaries"
          {...register('name', { required: 'Indicator name is required' })}
        />
        {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message?.toString()}</p>}
      </div>
      
      <div className="form-control">
        <label htmlFor="description" className="form-label">Description*</label>
        <textarea
          id="description"
          rows={3}
          className={`form-input ${errors.description ? 'border-error-500' : ''}`}
          placeholder="Description of what this indicator measures and why it's important"
          {...register('description', { required: 'Description is required' })}
        ></textarea>
        {errors.description && <p className="mt-1 text-sm text-error-600">{errors.description.message?.toString()}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label htmlFor="category" className="form-label">Category*</label>
          <select
            id="category"
            className="form-select"
            {...register('category', { required: true })}
          >
            <option value="Quantitative">Quantitative</option>
            <option value="Qualitative">Qualitative</option>
          </select>
        </div>
        
        <div className="form-control">
          <label htmlFor="unit" className="form-label">Unit of Measurement*</label>
          <input
            id="unit"
            type="text"
            className={`form-input ${errors.unit ? 'border-error-500' : ''}`}
            placeholder="e.g., people, tons, percentage"
            {...register('unit', { required: 'Unit is required' })}
          />
          {errors.unit && <p className="mt-1 text-sm text-error-600">{errors.unit.message?.toString()}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-control">
          <label htmlFor="start_value" className="form-label">Starting Value</label>
          <input
            id="start_value"
            type="number"
            step="any"
            className="form-input"
            placeholder="Initial value"
            {...register('start_value', { valueAsNumber: true })}
          />
        </div>
        
        <div className="form-control">
          <label htmlFor="current_value" className="form-label">Current Value</label>
          <input
            id="current_value"
            type="number"
            step="any"
            className="form-input"
            placeholder="Current value"
            {...register('current_value', { valueAsNumber: true })}
          />
        </div>
        
        <div className="form-control">
          <label htmlFor="target_value" className="form-label">Target Value*</label>
          <input
            id="target_value"
            type="number"
            step="any"
            className={`form-input ${errors.target_value ? 'border-error-500' : ''}`}
            placeholder="Goal to achieve"
            {...register('target_value', { 
              required: 'Target value is required',
              valueAsNumber: true 
            })}
          />
          {errors.target_value && <p className="mt-1 text-sm text-error-600">{errors.target_value.message?.toString()}</p>}
        </div>
      </div>
      
      <div className="form-control">
        <label className="form-label">SDG Goals (Select all that apply)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <Controller
            name="sdg_goals"
            control={control}
            render={({ field }) => (
              <>
                {SDG_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center">
                    <input
                      id={`sdg-${option.value}`}
                      type="checkbox"
                      className="form-checkbox"
                      value={option.value}
                      checked={field.value?.includes(option.value)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const value = parseInt(e.target.value);
                        const currentValues = field.value || [];
                        
                        field.onChange(
                          checked 
                            ? [...currentValues, value] 
                            : currentValues.filter(v => v !== value)
                        );
                      }}
                    />
                    <label htmlFor={`sdg-${option.value}`} className="ml-2 text-sm text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </>
            )}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label htmlFor="data_collection_method" className="form-label">Data Collection Method*</label>
          <input
            id="data_collection_method"
            type="text"
            className={`form-input ${errors.data_collection_method ? 'border-error-500' : ''}`}
            placeholder="e.g., Surveys, Observation, Administrative data"
            {...register('data_collection_method', { required: 'Data collection method is required' })}
          />
          {errors.data_collection_method && <p className="mt-1 text-sm text-error-600">{errors.data_collection_method.message?.toString()}</p>}
        </div>
        
        <div className="form-control">
          <label htmlFor="frequency" className="form-label">Measurement Frequency*</label>
          <select
            id="frequency"
            className="form-select"
            {...register('frequency', { required: true })}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annually">Annually</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Indicator'
          )}
        </button>
      </div>
    </form>
  );
};

export default IndicatorForm;