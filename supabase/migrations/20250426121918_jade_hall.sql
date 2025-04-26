/*
  # Create Forms Table

  1. New Tables
    - `forms` table for storing data collection forms
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `project_id` (uuid, references projects)
      - `form_type` (text)
      - `target_group` (text)
      - `deadline` (date)
      - `status` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on forms table
    - Add policies for authenticated users
*/

-- Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  form_type text NOT NULL,
  target_group text NOT NULL,
  deadline date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  questions jsonb DEFAULT '[]',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Forms are viewable by authenticated users"
  ON public.forms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Forms are insertable by authenticated users"
  ON public.forms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Forms are updatable by creator or admin"
  ON public.forms
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );