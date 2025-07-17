-- Report Schedules Table
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('compliance', 'performance', 'financial', 'custom')),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv')),
    recipients TEXT[] NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE NOT NULL,
    template_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report History Table
CREATE TABLE IF NOT EXISTS report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES report_schedules(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'failed', 'processing')),
    file_path TEXT,
    file_size BIGINT,
    generation_time_ms INTEGER,
    recipients_sent TEXT[],
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    template_config JSONB NOT NULL DEFAULT '{}',
    fields JSONB NOT NULL DEFAULT '[]',
    is_system_template BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_schedules_contractor_id ON report_schedules(contractor_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_report_schedules_status ON report_schedules(status);
CREATE INDEX IF NOT EXISTS idx_report_history_schedule_id ON report_history(schedule_id);
CREATE INDEX IF NOT EXISTS idx_report_history_created_at ON report_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_history_status ON report_history(status);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);

-- Row Level Security (RLS)
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own report schedules" ON report_schedules
    FOR SELECT USING (contractor_id = auth.uid()::uuid);

CREATE POLICY "Users can insert their own report schedules" ON report_schedules
    FOR INSERT WITH CHECK (contractor_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own report schedules" ON report_schedules
    FOR UPDATE USING (contractor_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their own report schedules" ON report_schedules
    FOR DELETE USING (contractor_id = auth.uid()::uuid);

CREATE POLICY "Users can view their own report history" ON report_history
    FOR SELECT USING (
        schedule_id IN (
            SELECT id FROM report_schedules WHERE contractor_id = auth.uid()::uuid
        )
    );

CREATE POLICY "System can insert report history" ON report_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can view system templates" ON report_templates
    FOR SELECT USING (is_system_template = true);

CREATE POLICY "Users can view their own templates" ON report_templates
    FOR SELECT USING (created_by = auth.uid()::uuid);

CREATE POLICY "Users can create their own templates" ON report_templates
    FOR INSERT WITH CHECK (created_by = auth.uid()::uuid);

-- Insert default report templates
INSERT INTO report_templates (name, description, report_type, template_config, fields, is_system_template) VALUES
(
    'Section 3 Compliance Report',
    'Comprehensive compliance status and metrics for Section 3 requirements',
    'compliance',
    '{"sections": ["summary", "worker_hours", "compliance_metrics", "training_records", "recommendations"]}',
    '["Worker hours", "Compliance percentage", "Training records", "Geographic distribution", "Wage analysis"]',
    true
),
(
    'Performance Dashboard',
    'Key performance indicators and trends for project performance',
    'performance',
    '{"sections": ["kpis", "trends", "productivity", "quality_metrics", "project_progress"]}',
    '["Project progress", "Worker productivity", "Quality metrics", "Timeline adherence", "Budget utilization"]',
    true
),
(
    'Financial Summary',
    'Budget utilization and cost analysis for Section 3 compliance',
    'financial',
    '{"sections": ["budget_overview", "cost_analysis", "roi_metrics", "variance_analysis"]}',
    '["Budget vs actual", "Cost per worker", "ROI analysis", "Training costs", "Administrative overhead"]',
    true
),
(
    'Monthly HUD Report',
    'Standard monthly report for HUD submission',
    'compliance',
    '{"sections": ["executive_summary", "compliance_status", "worker_data", "training_summary", "next_steps"], "format": "hud_standard"}',
    '["Total labor hours", "Section 3 hours", "Worker count", "Training hours", "Business enterprises"]',
    true
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get next run date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_run_date(frequency_type VARCHAR, base_date TIMESTAMP WITH TIME ZONE DEFAULT NOW())
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    CASE frequency_type
        WHEN 'daily' THEN
            RETURN base_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            RETURN base_date + INTERVAL '1 week';
        WHEN 'monthly' THEN
            RETURN base_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN
            RETURN base_date + INTERVAL '3 months';
        WHEN 'annually' THEN
            RETURN base_date + INTERVAL '1 year';
        ELSE
            RETURN base_date + INTERVAL '1 day';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Sample data for demonstration
INSERT INTO report_schedules (
    contractor_id, 
    name, 
    report_type, 
    frequency, 
    format, 
    recipients, 
    next_run,
    template_config
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    'Weekly Section 3 Compliance Report',
    'compliance',
    'weekly',
    'pdf',
    ARRAY['compliance@agency.gov', 'director@agency.gov'],
    calculate_next_run_date('weekly'),
    '{"template_id": "section3_compliance", "include_charts": true, "detail_level": "comprehensive"}'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Monthly Performance Dashboard',
    'performance',
    'monthly',
    'excel',
    ARRAY['performance@agency.gov'],
    calculate_next_run_date('monthly'),
    '{"template_id": "performance_dashboard", "include_trends": true, "comparison_period": "previous_month"}'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Quarterly Financial Summary',
    'financial',
    'quarterly',
    'pdf',
    ARRAY['finance@agency.gov', 'audit@agency.gov'],
    calculate_next_run_date('quarterly'),
    '{"template_id": "financial_summary", "include_projections": true, "detail_level": "summary"}'
);

-- Sample report history
INSERT INTO report_history (
    schedule_id,
    report_name,
    status,
    file_path,
    file_size,
    generation_time_ms,
    recipients_sent
) VALUES 
(
    (SELECT id FROM report_schedules WHERE name = 'Weekly Section 3 Compliance Report' LIMIT 1),
    'Weekly Section 3 Compliance Report',
    'completed',
    '/reports/compliance-2024-01-08.pdf',
    2457600, -- 2.4 MB in bytes
    45000,   -- 45 seconds in milliseconds
    ARRAY['compliance@agency.gov', 'director@agency.gov']
),
(
    (SELECT id FROM report_schedules WHERE name = 'Monthly Performance Dashboard' LIMIT 1),
    'Monthly Performance Dashboard',
    'completed',
    '/reports/performance-2024-01.xlsx',
    5242880, -- 5.1 MB in bytes
    120000,  -- 2 minutes in milliseconds
    ARRAY['performance@agency.gov']
);
