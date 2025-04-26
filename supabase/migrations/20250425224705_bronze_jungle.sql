/*
  # Initial Setup: Users and Roles

  1. Create initial admin user
  2. Set up roles and permissions
  3. Enable row level security
*/

-- Create roles enum
CREATE TYPE user_role AS ENUM ('admin', 'contributor', 'reviewer');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'contributor',
  organization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Insert admin user
INSERT INTO users (id, email, role, organization)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- This will be replaced with the actual UUID after user creation
  'admin@example.com',
  'admin',
  'Impact Monitor Admin'
);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role)
  VALUES (new.id, new.email, 'contributor');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();