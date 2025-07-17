-- Worker Management Schema
-- This script adds comprehensive worker management tables

-- Workers table (enhanced)
CREATE TABLE IF NOT EXISTS workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  is_section3_worker BOOLEAN DEFAULT false,
  is_targeted_section3_worker BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'flagged', 'rejected')),
  verification_documents JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  hourly_rate DECIMAL(10,2),
  hire_date DATE,
  termination_date DATE,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker verifications table
CREATE TABLE IF NOT EXISTS worker_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL, -- 'section3', 'identity', 'eligibility'
  document_type VARCHAR(100) NOT NULL,
  document_url TEXT,
  document_hash VARCHAR(256), -- For integrity verification
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker skills table
CREATE TABLE IF NOT EXISTS worker_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50), -- 'construction', 'electrical', 'plumbing', etc.
  proficiency_level VARCHAR(20) DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  certified BOOLEAN DEFAULT false,
  certification_date DATE,
  certification_body VARCHAR(200),
  certification_number VARCHAR(100),
  expiration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker employment history
CREATE TABLE IF NOT EXISTS worker_employment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  contractor_id UUID REFERENCES contractor_registrations(id),
  position_title VARCHAR(200),
  start_date DATE NOT NULL,
  end_date DATE,
  hourly_rate DECIMAL(10,2),
  total_hours_worked DECIMAL(10,2) DEFAULT 0,
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
  supervisor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker training records
CREATE TABLE IF NOT EXISTS worker_training_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  training_name VARCHAR(200) NOT NULL,
  training_type VARCHAR(50), -- 'safety', 'skills', 'compliance'
  training_provider VARCHAR(200),
  completion_date DATE,
  expiration_date DATE,
  certificate_url TEXT,
  hours_completed DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker performance metrics
CREATE TABLE IF NOT EXISTS worker_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  evaluation_period_start DATE NOT NULL,
  evaluation_period_end DATE NOT NULL,
  total_hours_worked DECIMAL(10,2) DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2), -- Percentage
  quality_score DECIMAL(3,2), -- 1-5 scale
  safety_incidents INTEGER DEFAULT 0,
  training_hours_completed DECIMAL(5,2) DEFAULT 0,
  supervisor_rating INTEGER CHECK (supervisor_rating BETWEEN 1 AND 5),
  peer_rating INTEGER CHECK (peer_rating BETWEEN 1 AND 5),
  notes TEXT,
  evaluated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker availability schedule
CREATE TABLE IF NOT EXISTS worker_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  effective_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker emergency contacts
CREATE TABLE IF NOT EXISTS worker_emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  contact_name VARCHAR(200) NOT NULL,
  relationship VARCHAR(50),
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  is_primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workers_section3 ON workers(is_section3_worker);
CREATE INDEX IF NOT EXISTS idx_workers_targeted ON workers(is_targeted_section3_worker);
CREATE INDEX IF NOT EXISTS idx_workers_verification_status ON workers(verification_status);
CREATE INDEX IF NOT EXISTS idx_workers_availability ON workers(availability_status);
CREATE INDEX IF NOT EXISTS idx_worker_verifications_status ON worker_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_worker_skills_category ON worker_skills(skill_category);
CREATE INDEX IF NOT EXISTS idx_worker_employment_dates ON worker_employment_history(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_worker_training_status ON worker_training_records(status);
CREATE INDEX IF NOT EXISTS idx_worker_performance_period ON worker_performance_metrics(evaluation_period_start, evaluation_period_end);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_verifications_updated_at BEFORE UPDATE ON worker_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_skills_updated_at BEFORE UPDATE ON worker_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_employment_history_updated_at BEFORE UPDATE ON worker_employment_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_training_records_updated_at BEFORE UPDATE ON worker_training_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_performance_metrics_updated_at BEFORE UPDATE ON worker_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_availability_updated_at BEFORE UPDATE ON worker_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_emergency_contacts_updated_at BEFORE UPDATE ON worker_emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_employment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on specific requirements)
CREATE POLICY "Users can view workers" ON workers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage workers" ON workers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view worker verifications" ON worker_verifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage worker verifications" ON worker_verifications FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view worker skills" ON worker_skills FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage worker skills" ON worker_skills FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view employment history" ON worker_employment_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage employment history" ON worker_employment_history FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view training records" ON worker_training_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage training records" ON worker_training_records FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view performance metrics" ON worker_performance_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage performance metrics" ON worker_performance_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view availability" ON worker_availability FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Workers can manage their own availability" ON worker_availability FOR ALL USING (auth.uid()::text = worker_id::text);
CREATE POLICY "Admins can manage all availability" ON worker_availability FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view emergency contacts" ON worker_emergency_contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Workers can manage their own emergency contacts" ON worker_emergency_contacts FOR ALL USING (auth.uid()::text = worker_id::text);
CREATE POLICY "Admins can manage all emergency contacts" ON worker_emergency_contacts FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
