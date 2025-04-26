import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ProjectIndicator {
  id: string;
  project_id: string;
  name: string;
  value: number;
  unit: string;
  category: 'Environmental' | 'Social' | 'Governance';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  location: string;
  category: 'Environmental' | 'Social' | 'Governance';
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  start_date: string;
  end_date: string | null;
  budget: number;
  manager: string;
  sdgs: number[];
  image_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  indicators: ProjectIndicator[];
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_indicators (
            id,
            project_id,
            name,
            value,
            unit,
            category,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw new Error(error.message);
      }

      // Rename project_indicators to indicators for consistency
      const formattedData = data?.map(project => ({
        ...project,
        indicators: project.project_indicators || [],
      })) || [];

      setProjects(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time inserts on projects
    const projectSubscription = supabase
      .channel('projects')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    // Subscribe to real-time inserts on project_indicators
    const indicatorSubscription = supabase
      .channel('project_indicators')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_indicators',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectSubscription);
      supabase.removeChannel(indicatorSubscription);
    };
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}