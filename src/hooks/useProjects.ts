import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables, Enums } from '../types/supabase';

// Define type aliases for clarity
type Project = Tables<"projects">;
type ProjectCategory = Enums<"project_category">;
type ProjectStatus = Enums<"project_status">;

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setProjects(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError || !authData.session) {
        throw new Error('You must be logged in to create a project');
      }

      const createdBy = authData.session.user.id;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: createdBy,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProjects([data, ...projects]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating project:', err);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProjects(projects.map(project => (project.id === id ? data : project)));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating project:', err);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: string) {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setProjects(projects.filter(project => project.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting project:', err);
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  }

  async function getProjectById(id: string) {
    const project = projects.find(project => project.id === id);
    if (project) {
      return project;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }

    return data || null;
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
  };
}