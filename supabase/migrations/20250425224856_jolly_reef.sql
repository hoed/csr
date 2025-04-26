/*
  # Seed Initial Data
  
  1. Mock Projects
  2. Mock Indicators
  3. Mock Measurements
  4. Mock Activities
*/

-- Insert mock projects
INSERT INTO public.projects 
(name, description, location, category, status, start_date, end_date, budget, manager, sdgs, image_url)
VALUES
(
  'Clean Water Initiative',
  'Providing clean water access to rural communities',
  'Eastern Region',
  'Environmental',
  'Active',
  '2023-06-01',
  '2023-12-31',
  250000,
  'Jane Smith',
  ARRAY[6, 3],
  'https://images.pexels.com/photos/1327430/pexels-photo-1327430.jpeg'
),
(
  'Youth Education Program',
  'Improving access to quality education for underprivileged youth',
  'Western District',
  'Social',
  'Active',
  '2023-03-15',
  '2024-03-14',
  175000,
  'Michael Johnson',
  ARRAY[4, 10],
  'https://images.pexels.com/photos/8466617/pexels-photo-8466617.jpeg'
),
(
  'Renewable Energy Transition',
  'Supporting local businesses in adopting renewable energy solutions',
  'Northern Province',
  'Environmental',
  'Planning',
  '2023-09-01',
  null,
  500000,
  'Sarah Williams',
  ARRAY[7, 13],
  'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg'
);

-- Insert mock indicators
INSERT INTO public.indicators 
(project_id, name, description, category, unit, target_value, current_value, start_value, sdg_goals, data_collection_method, frequency)
VALUES
(
  (SELECT id FROM public.projects WHERE name = 'Clean Water Initiative' LIMIT 1),
  'Clean Water Access',
  'Number of people with new access to clean water',
  'Quantitative',
  'people',
  5000,
  2500,
  0,
  ARRAY[6],
  'Community surveys',
  'Monthly'
),
(
  (SELECT id FROM public.projects WHERE name = 'Clean Water Initiative' LIMIT 1),
  'Water Quality',
  'Water quality index improvement',
  'Quantitative',
  'index value',
  95,
  80,
  65,
  ARRAY[6, 3],
  'Lab testing',
  'Weekly'
),
(
  (SELECT id FROM public.projects WHERE name = 'Youth Education Program' LIMIT 1),
  'Student Enrollment',
  'Number of students enrolled in program',
  'Quantitative',
  'students',
  250,
  180,
  0,
  ARRAY[4],
  'Registration records',
  'Quarterly'
);

-- Insert mock measurements
INSERT INTO public.measurements 
(indicator_id, value, date, notes)
VALUES
(
  (SELECT id FROM public.indicators WHERE name = 'Clean Water Access' LIMIT 1),
  500,
  '2023-06-15',
  'Initial community reached'
),
(
  (SELECT id FROM public.indicators WHERE name = 'Clean Water Access' LIMIT 1),
  1200,
  '2023-07-15',
  'Expanded to neighboring villages'
),
(
  (SELECT id FROM public.indicators WHERE name = 'Water Quality' LIMIT 1),
  70,
  '2023-06-10',
  'First water quality testing after treatment plant installation'
),
(
  (SELECT id FROM public.indicators WHERE name = 'Water Quality' LIMIT 1),
  75,
  '2023-07-10',
  'Improvements after adjusting treatment process'
);

-- Insert mock activities
INSERT INTO public.activities 
(project_id, title, description, status, date)
VALUES
(
  (SELECT id FROM public.projects WHERE name = 'Clean Water Initiative' LIMIT 1),
  'Project Planning Phase',
  'Defined project scope, objectives, and timeline',
  'Completed',
  '2023-05-01'
),
(
  (SELECT id FROM public.projects WHERE name = 'Clean Water Initiative' LIMIT 1),
  'Stakeholder Engagement',
  'Conducted meetings with key stakeholders and community representatives',
  'Completed',
  '2023-05-15'
),
(
  (SELECT id FROM public.projects WHERE name = 'Youth Education Program' LIMIT 1),
  'Initial Assessment',
  'Evaluated current education needs and gaps',
  'Completed',
  '2023-03-20'
);