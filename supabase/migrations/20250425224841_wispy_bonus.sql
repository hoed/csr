/*
  # Initial Database Schema Setup

  1. Tables
    - users (auth and profile data)
    - projects (impact projects)
    - indicators (impact metrics)
    - measurements (indicator data points)
    - activities (project timeline events)
    - reports (generated reports)

  2. Security
    - Enable RLS on all tables
    - Set up access policies
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'contributor', 'reviewer');
CREATE TYPE project_status AS ENUM ('Planning', 'Active', 'Completed', 'Cancelled');
CREATE TYPE project_category AS ENUM ('Environmental', 'Social', 'Governance');
CREATE TYPE indicator_category AS ENUM ('Quantitative', 'Qualitative');
CREATE TYPE measurement_frequency AS ENUM ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually');

-- Create users table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'contributor',
  organization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  category project_category NOT NULL,
  status project_status NOT NULL DEFAULT 'Planning',
  start_date date NOT NULL,
  end_date date,
  budget numeric NOT NULL DEFAULT 0,
  manager text NOT NULL,
  sdgs integer[] DEFAULT '{}',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create indicators table
CREATE TABLE IF NOT EXISTS public.indicators (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category indicator_category NOT NULL,
  unit text NOT NULL,
  target_value numeric,
  current_value numeric,
  start_value numeric,
  sdg_goals integer[] DEFAULT '{}',
  data_collection_method text,
  frequency measurement_frequency NOT NULL DEFAULT 'Monthly',
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz,
  created_by uuid REFERENCES auth.users(id)
);

-- Create measurements table
CREATE TABLE IF NOT EXISTS public.measurements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  indicator_id uuid REFERENCES public.indicators(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  date timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Projects are viewable by authenticated users" ON public.projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Projects are insertable by authenticated users" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Projects are updatable by creator or admin" ON public.projects
  FOR UPDATE TO authenticated USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Indicators are viewable by authenticated users" ON public.indicators
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Measurements are viewable by authenticated users" ON public.measurements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Activities are viewable by authenticated users" ON public.activities
  FOR SELECT TO authenticated USING (true);