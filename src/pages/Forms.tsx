import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  project_id: string;
  form_type: 'survey' | 'assessment' | 'feedback';
  target_group: string;
  deadline: string;
  questions: { text: string }[];
}

interface Project {
  id: string;
  name: string;
}

function Forms() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [submittedForms, setSubmittedForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      questions: [{ text: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  useEffect(() => {
    fetchProjects();
    fetchSubmittedForms();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name');
      
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchSubmittedForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select(`
          *,
          projects (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubmittedForms(data || []);
    } catch (err) {
      console.error('Error fetching forms:', err);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: submitError } = await supabase
        .from('forms')
        .insert([{
          ...data,
          questions: data.questions.map(q => q.text), // Convert to string array
          created_by: user?.id,
          status: 'active'
        }]);

      if (submitError) throw submitError;

      setSuccess(true);
      reset();
      fetchSubmittedForms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Collection Forms</h1>
        <p className="mt-2 text-gray-600">Create and manage data collection forms for your projects.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Form Creation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Create New Form</h2>

          {error && (
            <div className="mb-4 p-4 bg-error-50 text-error-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-success-50 text-success-700 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Form created successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="form-input w-full"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                className="form-select w-full"
                {...register('project_id', { required: 'Project is required' })}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errors.project_id && (
                <p className="mt-1 text-sm text-error-600">{errors.project_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
              <select
                className="form-select w-full"
                {...register('form_type', { required: 'Form type is required' })}
              >
                <option value="survey">Survey</option>
                <option value="assessment">Assessment</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Group</label>
              <input
                type="text"
                className="form-input w-full"
                {...register('target_group', { required: 'Target group is required' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                className="form-input w-full"
                {...register('deadline', { required: 'Deadline is required' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="form-input w-full"
                rows={3}
                {...register('description', { required: 'Description is required' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder={`Question ${index + 1}`}
                    {...register(`questions.${index}.text`, { required: 'Question is required' })}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              {errors.questions && (
                <p className="mt-1 text-sm text-error-600">All questions must be filled</p>
              )}
              <button
                type="button"
                onClick={() => append({ text: '' })}
                className="flex items-center text-primary-600 hover:text-primary-700 mt-2"
              >
                <PlusCircle size={16} className="mr-1" />
                Add Question
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Creating...' : 'Create Form'}
            </button>
          </form>
        </div>

        {/* Submitted Forms List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Submitted Forms</h2>
          
          <div className="space-y-4">
            {submittedForms.map((form) => (
              <div
                key={form.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{form.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {form.form_type}
                  </span>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Project: {form.projects?.name}</p>
                  <p>Target: {form.target_group}</p>
                  <p>Deadline: {new Date(form.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            ))}

            {submittedForms.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No forms submitted yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forms;