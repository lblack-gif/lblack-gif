-- Seed data for Worker Management System
-- This script populates the worker management tables with realistic test data

-- Insert sample workers
INSERT INTO workers (
  first_name, last_name, email, phone, address, city, state, zip_code,
  is_section3_worker, is_targeted_section3_worker, verification_status,
  skills, certifications, hourly_rate, hire_date
) VALUES 
-- Section 3 Workers
('Maria', 'Rodriguez', 'maria.rodriguez@email.com', '(555) 123-4567', 
 '123 Main St', 'Washington', 'DC', '20001', 
 true, true, 'verified', 
 '["Construction", "Electrical", "Safety"]', 
 '["OSHA 10", "Electrical License"]', 
 28.50, '2024-01-15'),

('James', 'Washington', 'james.washington@email.com', '(555) 234-5678',
 '456 Oak Ave', 'Washington', 'DC', '20002',
 true, false, 'verified',
 '["Plumbing", "HVAC", "Welding"]',
 '["Plumbing License", "HVAC Certification"]',
 32.00, '2024-02-01'),

('Angela', 'Thompson', 'angela.thompson@email.com', '(555) 345-6789',
 '789 Pine St', 'Washington', 'DC', '20003',
 true, true, 'verified',
 '["Carpentry", "Drywall", "Painting"]',
 '["Carpentry Certification"]',
 26.75, '2024-01-20'),

('Robert', 'Johnson', 'robert.johnson@email.com', '(555) 456-7890',
 '321 Elm St', 'Washington', 'DC', '20004',
 true, false, 'verified',
 '["Heavy Equipment", "Concrete", "Construction"]',
 '["CDL License", "Heavy Equipment Operator"]',
 35.00, '2024-03-01'),

('Lisa', 'Davis', 'lisa.davis@email.com', '(555) 567-8901',
 '654 Maple Ave', 'Washington', 'DC', '20005',
 true, true, 'pending',
 '["Administrative", "Project Management"]',
 '["PMP Certification"]',
 42.00, '2024-03-15'),

-- Regular Workers
('Michael', 'Brown', 'michael.brown@email.com', '(555) 678-9012',
 '987 Cedar St', 'Arlington', 'VA', '22201',
 false, false, 'verified',
 '["Electrical", "Controls", "Automation"]',
 '["Master Electrician", "PLC Programming"]',
 45.00, '2024-01-10'),

('Sarah', 'Wilson', 'sarah.wilson@email.com', '(555) 789-0123',
 '147 Birch Ln', 'Alexandria', 'VA', '22301',
 false, false, 'verified',
 '["Architecture", "CAD", "Design"]',
 '["Professional Engineer", "LEED AP"]',
 55.00, '2024-02-15'),

('David', 'Miller', 'david.miller@email.com', '(555) 890-1234',
 '258 Spruce St', 'Bethesda', 'MD', '20814',
 false, false, 'verified',
 '["Project Management", "Construction", "Safety"]',
 '["PMP", "Construction Manager", "OSHA 30"]',
 65.00, '2024-01-05'),

-- Pending verification workers
('Carmen', 'Garcia', 'carmen.garcia@email.com', '(555) 901-2345',
 '369 Willow Dr', 'Washington', 'DC', '20006',
 true, true, 'pending',
 '["Landscaping", "Maintenance"]',
 '[]',
 22.00, '2024-03-20'),

('Kevin', 'Lee', 'kevin.lee@email.com', '(555) 012-3456',
 '741 Poplar St', 'Washington', 'DC', '20007',
 true, false, 'pending',
 '["General Labor", "Demolition"]',
 '["OSHA 10"]',
 20.00, '2024-03-25');

-- Insert worker verifications
INSERT INTO worker_verifications (
  worker_id, verification_type, document_type, verification_status, verified_at, notes
) 
SELECT 
  w.id,
  'section3',
  'Income Verification',
  CASE WHEN w.verification_status = 'verified' THEN 'approved' ELSE 'pending' END,
  CASE WHEN w.verification_status = 'verified' THEN NOW() - INTERVAL '30 days' ELSE NULL END,
  CASE WHEN w.verification_status = 'verified' THEN 'Documentation verified and approved' ELSE 'Pending document review' END
FROM workers w
WHERE w.is_section3_worker = true;

-- Insert worker skills (detailed breakdown)
INSERT INTO worker_skills (worker_id, skill_name, skill_category, proficiency_level, certified, certification_date)
SELECT 
  w.id,
  skill_data.skill_name,
  skill_data.category,
  skill_data.proficiency,
  skill_data.certified,
  CASE WHEN skill_data.certified THEN w.hire_date + INTERVAL '30 days' ELSE NULL END
FROM workers w
CROSS JOIN (
  VALUES 
    ('Construction', 'construction', 'advanced', true),
    ('Electrical', 'electrical', 'intermediate', true),
    ('Safety', 'safety', 'advanced', true),
    ('Plumbing', 'plumbing', 'expert', true),
    ('HVAC', 'hvac', 'advanced', true),
    ('Welding', 'welding', 'intermediate', false),
    ('Carpentry', 'construction', 'advanced', true),
    ('Drywall', 'construction', 'intermediate', false),
    ('Painting', 'construction', 'intermediate', false),
    ('Heavy Equipment', 'equipment', 'expert', true),
    ('Concrete', 'construction', 'advanced', false),
    ('Administrative', 'office', 'expert', false),
    ('Project Management', 'management', 'expert', true)
) AS skill_data(skill_name, category, proficiency, certified)
WHERE w.skills::text LIKE '%' || skill_data.skill_name || '%';

-- Insert employment history
INSERT INTO worker_employment_history (
  worker_id, project_id, position_title, start_date, end_date, 
  hourly_rate, total_hours_worked, performance_rating
)
SELECT 
  w.id,
  p.id,
  CASE 
    WHEN w.skills::text LIKE '%Management%' THEN 'Project Supervisor'
    WHEN w.skills::text LIKE '%Electrical%' THEN 'Electrician'
    WHEN w.skills::text LIKE '%Plumbing%' THEN 'Plumber'
    WHEN w.skills::text LIKE '%Carpentry%' THEN 'Carpenter'
    ELSE 'Construction Worker'
  END,
  w.hire_date,
  CASE WHEN p.status = 'completed' THEN w.hire_date + INTERVAL '6 months' ELSE NULL END,
  w.hourly_rate,
  CASE WHEN p.status = 'completed' THEN 960.0 ELSE 480.0 END, -- 6 months or 3 months of work
  CASE WHEN w.verification_status = 'verified' THEN 4 ELSE 3 END
FROM workers w
CROSS JOIN projects p
WHERE w.hire_date <= CURRENT_DATE
LIMIT 20; -- Limit to avoid too many combinations

-- Insert training records
INSERT INTO worker_training_records (
  worker_id, training_name, training_type, training_provider, 
  completion_date, hours_completed, status
)
SELECT 
  w.id,
  training_data.name,
  training_data.type,
  training_data.provider,
  w.hire_date + INTERVAL '2 weeks',
  training_data.hours,
  'completed'
FROM workers w
CROSS JOIN (
  VALUES 
    ('OSHA 10-Hour Construction Safety', 'safety', 'OSHA Training Institute', 10),
    ('Section 3 Compliance Training', 'compliance', 'HUD Training Center', 4),
    ('Basic First Aid/CPR', 'safety', 'Red Cross', 8),
    ('Workplace Harassment Prevention', 'compliance', 'HR Training Solutions', 2),
    ('Equipment Safety Training', 'safety', 'Safety Training Corp', 6)
) AS training_data(name, type, provider, hours)
WHERE w.verification_status = 'verified';

-- Insert performance metrics
INSERT INTO worker_performance_metrics (
  worker_id, evaluation_period_start, evaluation_period_end,
  total_hours_worked, projects_completed, attendance_rate,
  quality_score, safety_incidents, training_hours_completed,
  supervisor_rating, peer_rating
)
SELECT 
  w.id,
  DATE_TRUNC('month', w.hire_date),
  DATE_TRUNC('month', w.hire_date) + INTERVAL '3 months' - INTERVAL '1 day',
  CASE WHEN w.verification_status = 'verified' THEN 480.0 ELSE 240.0 END,
  CASE WHEN w.verification_status = 'verified' THEN 2 ELSE 1 END,
  CASE WHEN w.verification_status = 'verified' THEN 95.5 ELSE 88.2 END,
  CASE WHEN w.verification_status = 'verified' THEN 4.2 ELSE 3.8 END,
  0, -- No safety incidents for seed data
  30.0, -- Training hours
  CASE WHEN w.verification_status = 'verified' THEN 4 ELSE 3 END,
  CASE WHEN w.verification_status = 'verified' THEN 4 ELSE 3 END
FROM workers w
WHERE w.hire_date <= CURRENT_DATE - INTERVAL '3 months';

-- Insert worker availability (standard work week)
INSERT INTO worker_availability (worker_id, day_of_week, start_time, end_time, is_available)
SELECT 
  w.id,
  dow.day_of_week,
  '07:00'::time,
  '16:00'::time,
  CASE WHEN dow.day_of_week IN (0, 6) THEN false ELSE true END -- Weekend unavailable
FROM workers w
CROSS JOIN (
  SELECT generate_series(0, 6) AS day_of_week
) dow
WHERE w.availability_status = 'available';

-- Insert emergency contacts
INSERT INTO worker_emergency_contacts (
  worker_id, contact_name, relationship, phone_primary, is_primary_contact
)
SELECT 
  w.id,
  CASE 
    WHEN w.first_name = 'Maria' THEN 'Carlos Rodriguez'
    WHEN w.first_name = 'James' THEN 'Patricia Washington'
    WHEN w.first_name = 'Angela' THEN 'Michael Thompson'
    WHEN w.first_name = 'Robert' THEN 'Jennifer Johnson'
    WHEN w.first_name = 'Lisa' THEN 'Mark Davis'
    WHEN w.first_name = 'Michael' THEN 'Susan Brown'
    WHEN w.first_name = 'Sarah' THEN 'John Wilson'
    WHEN w.first_name = 'David' THEN 'Linda Miller'
    WHEN w.first_name = 'Carmen' THEN 'Jose Garcia'
    WHEN w.first_name = 'Kevin' THEN 'Amy Lee'
    ELSE 'Emergency Contact'
  END,
  'Spouse',
  '(555) ' || LPAD((RANDOM() * 900 + 100)::int::text, 3, '0') || '-' || LPAD((RANDOM() * 9000 + 1000)::int::text, 4, '0'),
  true
FROM workers w;

-- Update worker statistics
UPDATE workers SET 
  emergency_contact_name = ec.contact_name,
  emergency_contact_phone = ec.phone_primary
FROM worker_emergency_contacts ec 
WHERE workers.id = ec.worker_id AND ec.is_primary_contact = true;

-- Create some sample compliance alerts based on worker data
INSERT INTO compliance_alerts (
  alert_type, severity, title, description, project_id, contractor_id, 
  status, created_by
)
SELECT 
  'worker_verification',
  'medium',
  'Worker Verification Pending',
  'Worker ' || w.first_name || ' ' || w.last_name || ' requires document verification for Section 3 compliance.',
  NULL,
  NULL,
  'active',
  '00000000-0000-0000-0000-000000000000'
FROM workers w
WHERE w.verification_status = 'pending'
LIMIT 5;

-- Insert some worker-related audit entries
INSERT INTO audit_logs (
  table_name, record_id, action, old_values, new_values, 
  changed_by, ip_address
)
SELECT 
  'workers',
  w.id::text,
  'INSERT',
  '{}',
  jsonb_build_object(
    'first_name', w.first_name,
    'last_name', w.last_name,
    'is_section3_worker', w.is_section3_worker,
    'verification_status', w.verification_status
  ),
  '00000000-0000-0000-0000-000000000000',
  '192.168.1.100'
FROM workers w
WHERE w.created_at >= CURRENT_DATE - INTERVAL '30 days';
