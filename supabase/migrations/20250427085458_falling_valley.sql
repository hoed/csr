/*
  # Add Project SDGs Table
  
  1. New Tables
    - `project_sdgs` table for storing project SDG alignments
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `sdg_number` (integer)
      - `contribution_level` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create project_sdgs table
CREATE TABLE IF NOT EXISTS public.project_sdgs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  sdg_number integer NOT NULL CHECK (sdg_number BETWEEN 1 AND 17),
  contribution_level text NOT NULL CHECK (contribution_level IN ('direct', 'indirect')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.project_sdgs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Project SDGs are viewable by authenticated users"
  ON public.project_sdgs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project SDGs are insertable by authenticated users"
  ON public.project_sdgs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Project SDGs are updatable by creator or admin"
  ON public.project_sdgs
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Project SDGs are deletable by creator or admin"
  ON public.project_sdgs
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX project_sdgs_project_id_idx ON public.project_sdgs(project_id);