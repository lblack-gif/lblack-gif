-- AI Integration Schema for Section 3 Compliance System
-- This script adds tables for AI-powered features

-- Email classifications and AI processing
CREATE TABLE IF NOT EXISTS email_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id),
    classification VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    suggested_response TEXT,
    action_items TEXT[],
    processing_time_ms INTEGER,
    model_used VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract analyses and AI insights
CREATE TABLE IF NOT EXISTS contract_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_name VARCHAR(255) NOT NULL,
    contract_text TEXT,
    analysis_status VARCHAR(20) DEFAULT 'pending',
    section3_requirements JSONB,
    risk_factors TEXT[],
    recommendations TEXT[],
    compliance_score INTEGER,
    key_provisions TEXT[],
    deadlines JSONB,
    processing_time_ms INTEGER,
    model_used VARCHAR(50),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI model configurations and settings
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'email_classification', 'contract_analysis', 'response_generation'
    model_provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google'
    model_name VARCHAR(100) NOT NULL,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    max_tokens INTEGER DEFAULT 4000,
    temperature DECIMAL(3,2) DEFAULT 0.3,
    system_prompt TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI processing logs and performance metrics
CREATE TABLE IF NOT EXISTS ai_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL, -- 'email_classification', 'contract_analysis', 'report_generation'
    input_data JSONB,
    output_data JSONB,
    model_used VARCHAR(100),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_cents INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-generated responses and their approval status
CREATE TABLE IF NOT EXISTS ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id),
    generated_response TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'modified'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    modifications TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI training data and feedback for model improvement
CREATE TABLE IF NOT EXISTS ai_training_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL,
    input_data JSONB,
    ai_output JSONB,
    human_feedback JSONB,
    feedback_type VARCHAR(20), -- 'positive', 'negative', 'correction'
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
    feedback_notes TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated AI workflows and scheduling
CREATE TABLE IF NOT EXISTS ai_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(100) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL, -- 'email_processing', 'contract_review', 'report_generation'
    trigger_conditions JSONB,
    workflow_steps JSONB,
    schedule_cron VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI performance metrics and analytics
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    total_operations INTEGER DEFAULT 0,
    successful_operations INTEGER DEFAULT 0,
    average_confidence DECIMAL(5,4),
    average_processing_time_ms INTEGER,
    total_tokens_used INTEGER,
    total_cost_cents INTEGER,
    user_satisfaction_score DECIMAL(3,2),
    automation_rate DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date, operation_type)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_email_classifications_email_id ON email_classifications(email_id);
CREATE INDEX IF NOT EXISTS idx_email_classifications_classification ON email_classifications(classification);
CREATE INDEX IF NOT EXISTS idx_email_classifications_created_at ON email_classifications(created_at);

CREATE INDEX IF NOT EXISTS idx_contract_analyses_status ON contract_analyses(analysis_status);
CREATE INDEX IF NOT EXISTS idx_contract_analyses_created_at ON contract_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_contract_analyses_compliance_score ON contract_analyses(compliance_score);

CREATE INDEX IF NOT EXISTS idx_ai_processing_logs_operation_type ON ai_processing_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_ai_processing_logs_created_at ON ai_processing_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_processing_logs_success ON ai_processing_logs(success);

CREATE INDEX IF NOT EXISTS idx_ai_responses_email_id ON ai_responses(email_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_status ON ai_responses(status);
CREATE INDEX IF NOT EXISTS idx_ai_responses_created_at ON ai_responses(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_workflows_workflow_type ON ai_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_is_active ON ai_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_next_run ON ai_workflows(next_run);

CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_date_type ON ai_performance_metrics(metric_date, operation_type);

-- Insert default AI model configurations
INSERT INTO ai_model_configs (config_name, model_type, model_provider, model_name, confidence_threshold, system_prompt, created_by) VALUES
('Default Email Classification', 'email_classification', 'openai', 'gpt-4o', 0.85, 'You are an expert Section 3 compliance assistant. Classify emails according to HUD Section 3 requirements and generate appropriate responses.', '11111111-1111-1111-1111-111111111111'),
('Default Contract Analysis', 'contract_analysis', 'openai', 'gpt-4o', 0.90, 'You are an expert HUD Section 3 compliance analyst. Analyze contracts to identify Section 3 requirements, risks, and recommendations.', '11111111-1111-1111-1111-111111111111'),
('Default Response Generation', 'response_generation', 'openai', 'gpt-4o-mini', 0.80, 'You are a helpful Section 3 compliance assistant. Generate professional, accurate responses to compliance inquiries.', '11111111-1111-1111-1111-111111111111');

-- Insert default AI workflows
INSERT INTO ai_workflows (workflow_name, workflow_type, trigger_conditions, workflow_steps, schedule_cron, created_by) VALUES
('Auto Email Processing', 'email_processing', '{"confidence_threshold": 0.85, "auto_respond": true}', '[{"step": "classify", "model": "email_classification"}, {"step": "generate_response", "model": "response_generation"}, {"step": "queue_for_approval", "threshold": 0.90}]', '*/5 * * * *', '11111111-1111-1111-1111-111111111111'),
('Daily Contract Review', 'contract_review', '{"new_contracts": true}', '[{"step": "extract_text", "method": "ocr"}, {"step": "analyze_requirements", "model": "contract_analysis"}, {"step": "generate_report", "format": "pdf"}]', '0 9 * * *', '11111111-1111-1111-1111-111111111111'),
('Weekly Performance Report', 'report_generation', '{"report_type": "performance", "frequency": "weekly"}', '[{"step": "collect_metrics", "period": "7_days"}, {"step": "generate_insights", "model": "analysis"}, {"step": "create_report", "format": "pdf"}, {"step": "email_stakeholders", "recipients": "managers"}]', '0 8 * * 1', '11111111-1111-1111-1111-111111111111');

-- Create functions for AI metrics calculation
CREATE OR REPLACE FUNCTION calculate_ai_performance_metrics(metric_date DATE, operation_type VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ai_performance_metrics (
        metric_date,
        operation_type,
        total_operations,
        successful_operations,
        average_confidence,
        average_processing_time_ms,
        total_tokens_used,
        total_cost_cents,
        automation_rate
    )
    SELECT 
        metric_date,
        operation_type,
        COUNT(*) as total_operations,
        COUNT(*) FILTER (WHERE success = true) as successful_operations,
        AVG(CASE WHEN operation_type = 'email_classification' THEN 
            (output_data->>'confidence')::DECIMAL 
            ELSE NULL END) as average_confidence,
        AVG(processing_time_ms) as average_processing_time_ms,
        SUM(tokens_used) as total_tokens_used,
        SUM(cost_cents) as total_cost_cents,
        COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*) as automation_rate
    FROM ai_processing_logs
    WHERE DATE(created_at) = metric_date
    AND operation_type = calculate_ai_performance_metrics.operation_type
    GROUP BY DATE(created_at), operation_type
    ON CONFLICT (metric_date, operation_type) 
    DO UPDATE SET
        total_operations = EXCLUDED.total_operations,
        successful_operations = EXCLUDED.successful_operations,
        average_confidence = EXCLUDED.average_confidence,
        average_processing_time_ms = EXCLUDED.average_processing_time_ms,
        total_tokens_used = EXCLUDED.total_tokens_used,
        total_cost_cents = EXCLUDED.total_cost_cents,
        automation_rate = EXCLUDED.automation_rate;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update AI performance metrics
CREATE OR REPLACE FUNCTION update_ai_metrics_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily metrics for the operation
    PERFORM calculate_ai_performance_metrics(
        DATE(NEW.created_at),
        NEW.operation_type
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_processing_logs_metrics_trigger
    AFTER INSERT ON ai_processing_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_metrics_trigger();

-- Row Level Security policies for AI tables
ALTER TABLE email_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for email classifications
CREATE POLICY "Users can view email classifications for their organization" ON email_classifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM emails e
            JOIN projects p ON e.project_id = p.id
            JOIN contractors c ON p.contractor_id = c.id
            WHERE e.id = email_classifications.email_id
            AND (
                auth.jwt() ->> 'role' = 'hud_admin'
                OR (auth.jwt() ->> 'role' = 'contractor_manager' AND c.contact_email = auth.jwt() ->> 'email')
                OR (auth.jwt() ->> 'role' IN ('project_supervisor', 'field_worker') AND p.id IN (
                    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
                ))
            )
        )
    );

-- Policies for contract analyses
CREATE POLICY "Users can view contract analyses for their organization" ON contract_analyses
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'hud_admin'
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM contractors c
            WHERE c.contact_email = auth.jwt() ->> 'email'
            AND auth.jwt() ->> 'role' = 'contractor_manager'
        )
    );

CREATE POLICY "Authorized users can create contract analyses" ON contract_analyses
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('hud_admin', 'contractor_manager', 'project_supervisor')
    );

-- Policies for AI model configs (admin only)
CREATE POLICY "Only HUD admins can manage AI model configs" ON ai_model_configs
    FOR ALL USING (auth.jwt() ->> 'role' = 'hud_admin');

-- Policies for AI processing logs
CREATE POLICY "Users can view AI processing logs for their operations" ON ai_processing_logs
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'hud_admin'
        OR user_id = auth.uid()
    );

-- Policies for AI responses
CREATE POLICY "Users can view AI responses for their emails" ON ai_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM emails e
            JOIN projects p ON e.project_id = p.id
            JOIN contractors c ON p.contractor_id = c.id
            WHERE e.id = ai_responses.email_id
            AND (
                auth.jwt() ->> 'role' = 'hud_admin'
                OR (auth.jwt() ->> 'role' = 'contractor_manager' AND c.contact_email = auth.jwt() ->> 'email')
                OR (auth.jwt() ->> 'role' IN ('project_supervisor', 'field_worker') AND p.id IN (
                    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
                ))
            )
        )
    );

-- Policies for AI workflows (admin and managers)
CREATE POLICY "Managers can view and manage AI workflows" ON ai_workflows
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('hud_admin', 'contractor_manager')
    );

-- Policies for AI performance metrics
CREATE POLICY "All authenticated users can view AI performance metrics" ON ai_performance_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

COMMENT ON TABLE email_classifications IS 'AI-powered email classification results and metadata';
COMMENT ON TABLE contract_analyses IS 'AI-powered contract analysis results and Section 3 compliance insights';
COMMENT ON TABLE ai_model_configs IS 'Configuration settings for AI models used in the system';
COMMENT ON TABLE ai_processing_logs IS 'Detailed logs of all AI processing operations for monitoring and debugging';
COMMENT ON TABLE ai_responses IS 'AI-generated responses to emails with approval workflow';
COMMENT ON TABLE ai_training_feedback IS 'Human feedback on AI outputs for continuous model improvement';
COMMENT ON TABLE ai_workflows IS 'Automated AI workflows and their scheduling configuration';
COMMENT ON TABLE ai_performance_metrics IS 'Daily performance metrics and analytics for AI operations';
