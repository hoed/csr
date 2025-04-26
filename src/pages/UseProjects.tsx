// src/hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Define Project type (fallback if Supabase types are not generated)
interface Project {
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
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw new Error(error.message);
      }

      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time inserts
    const subscription = supabase
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

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
};