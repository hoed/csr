import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  category: 'Environmental' | 'Social' | 'Governance';
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  start_date: string;
  end_date: string | null;
  created_at: string;
  budget: number;
  manager: string;
  sdgs?: number[]; // Sustainable Development Goals
  image_url?: string;
}

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
      
      // This would be a real Supabase query in production
      // For demo purposes, we'll use mock data
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Clean Water Initiative',
          description: 'Providing clean water access to rural communities',
          location: 'Eastern Region',
          category: 'Environmental',
          status: 'Active',
          start_date: '2023-06-01',
          end_date: '2023-12-31',
          created_at: '2023-05-15',
          budget: 250000,
          manager: 'Jane Smith',
          sdgs: [6, 3],
          image_url: 'https://images.pexels.com/photos/1327430/pexels-photo-1327430.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: '2',
          name: 'Youth Education Program',
          description: 'Improving access to quality education for underprivileged youth',
          location: 'Western District',
          category: 'Social',
          status: 'Active',
          start_date: '2023-03-15',
          end_date: '2024-03-14',
          created_at: '2023-02-20',
          budget: 175000,
          manager: 'Michael Johnson',
          sdgs: [4, 10],
          image_url: 'https://images.pexels.com/photos/8466617/pexels-photo-8466617.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: '3',
          name: 'Renewable Energy Transition',
          description: 'Supporting local businesses in adopting renewable energy solutions',
          location: 'Northern Province',
          category: 'Environmental',
          status: 'Planning',
          start_date: '2023-09-01',
          end_date: null,
          created_at: '2023-07-10',
          budget: 500000,
          manager: 'Sarah Williams',
          sdgs: [7, 13],
          image_url: 'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: '4',
          name: 'Sustainable Agriculture',
          description: 'Training farmers in sustainable farming practices',
          location: 'Southern Region',
          category: 'Environmental',
          status: 'Completed',
          start_date: '2022-05-01',
          end_date: '2023-04-30',
          created_at: '2022-04-10',
          budget: 320000,
          manager: 'David Brown',
          sdgs: [2, 12, 15],
          image_url: 'https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
          id: '5',
          name: 'Community Health Outreach',
          description: 'Providing healthcare services to underserved communities',
          location: 'Central District',
          category: 'Social',
          status: 'Active',
          start_date: '2023-02-01',
          end_date: '2023-12-31',
          created_at: '2023-01-10',
          budget: 280000,
          manager: 'Lisa Chen',
          sdgs: [3],
          image_url: 'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ];
      
      setProjects(mockProjects);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(projectData: Omit<Project, 'id' | 'created_at'>) {
    try {
      setLoading(true);
      
      // This would interact with Supabase in a real app
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      
      setProjects([...projects, newProject]);
      return { data: newProject, error: null };
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
      
      const updatedProjects = projects.map(project => 
        project.id === id ? { ...project, ...updates } : project
      );
      
      setProjects(updatedProjects);
      return { data: updatedProjects.find(p => p.id === id), error: null };
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
      
      const filteredProjects = projects.filter(project => project.id !== id);
      setProjects(filteredProjects);
      
      return { error: null };
    } catch (err) {
      console.error('Error deleting project:', err);
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  }

  async function getProjectById(id: string) {
    return projects.find(project => project.id === id) || null;
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