/*
  # Add Project Images Support
  
  1. Create project_images table
  2. Add relations and policies
*/

CREATE TABLE IF NOT EXISTS public.project_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Project images are viewable by authenticated users"
  ON public.project_images
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project images are insertable by authenticated users"
  ON public.project_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Project images are deletable by creator or admin"
  ON public.project_images
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );