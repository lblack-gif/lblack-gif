-- Comprehensive data seeding for Section 3 Compliance System
-- This script populates all tables with realistic test data

-- Insert sample users with different roles
INSERT INTO users (id, email, first_name, last_name, role, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@hud.gov', 'Sarah', 'Johnson', 'hud_admin', NOW()),
('22222222-2222-2222-2222-222222222222', 'contractor1@acmecorp.com', 'Mike', 'Chen', 'contractor_manager', NOW()),
('33333333-3333-3333-3333-333333333333', 'supervisor@buildco.com', 'Lisa', 'Rodriguez', 'project_supervisor', NOW()),
('44444444-4444-4444-4444-444444444444', 'auditor@compliance.gov', 'David', 'Thompson', 'auditor', NOW()),
('55555555-5555-5555-5555-555555555555', 'field@mobilecorp.com', 'James', 'Wilson', 'field_worker', NOW());

-- Insert contractors
INSERT INTO contractors (id, name, contact_email, contact_phone, address, section3_certified, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ACME Construction Corp', 'contractor1@acmecorp.com', '(555) 123-4567', '123 Main St, Washington DC 20001', true, NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'BuildCo Industries', 'contact@buildco.com', '(555) 234-5678', '456 Oak Ave, Baltimore MD 21201', true, NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Metro Development LLC', 'info@metrodev.com', '(555) 345-6789', '789 Pine St, Arlington VA 22201', false, NOW());

-- Insert projects
INSERT INTO projects (id, name, hud_project_id, location, total_budget, start_date, end_date, status, contractor_id, created_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Downtown Housing Development', 'HUD-2024-001', '1000 K Street NW, Washington DC', 2500000.00, '2024-01-15', '2024-12-31', 'active', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Community Center Renovation', 'HUD-2024-002', '500 H Street NE, Washington DC', 1200000.00, '2024-02-01', '2024-10-30', 'active', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'School Infrastructure Upgrade', 'HUD-2024-003', '200 M Street SE, Washington DC', 800000.00, '2024-03-01', '2024-11-15', 'active', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW());

-- Insert workers with Section 3 status
INSERT INTO workers (id, first_name, last_name, email, phone, address, is_section3_worker, is_targeted_section3_worker, verification_status, hire_date, created_at) VALUES
('w1111111-1111-1111-1111-111111111111', 'John', 'Smith', 'john.smith@email.com', '(555) 111-1111', '100 A St SE, Washington DC 20003', true, true, 'verified', '2024-01-20', NOW()),
('w2222222-2222-2222-2222-222222222222', 'Maria', 'Garcia', 'maria.garcia@email.com', '(555) 222-2222', '200 B St NE, Washington DC 20002', true, false, 'verified', '2024-01-25', NOW()),
('w3333333-3333-3333-3333-333333333333', 'Robert', 'Johnson', 'robert.johnson@email.com', '(555) 333-3333', '300 C St NW, Washington DC 20001', false, false, 'verified', '2024-02-01', NOW()),
('w4444444-4444-4444-4444-444444444444', 'Jennifer', 'Brown', 'jennifer.brown@email.com', '(555) 444-4444', '400 D St SW, Washington DC 20024', true, true, 'verified', '2024-02-10', NOW()),
('w5555555-5555-5555-5555-555555555555', 'Michael', 'Davis', 'michael.davis@email.com', '(555) 555-5555', '500 E St SE, Washington DC 20003', true, false, 'pending', '2024-02-15', NOW());

-- Insert labor hours data
INSERT INTO labor_hours (id, project_id, contractor_id, worker_id, hours_worked, work_date, hourly_rate, job_category, verified, created_at) VALUES
-- January 2024 data
('lh111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w1111111-1111-1111-1111-111111111111', 8.0, '2024-01-22', 25.00, 'Construction', true, NOW()),
('lh222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w2222222-2222-2222-2222-222222222222', 8.0, '2024-01-22', 23.00, 'Construction', true, NOW()),
('lh333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'w3333333-3333-3333-3333-333333333333', 8.0, '2024-01-22', 28.00, 'Supervision', true, NOW()),
-- February 2024 data
('lh444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'w4444444-4444-4444-4444-444444444444', 8.0, '2024-02-12', 24.00, 'Renovation', true, NOW()),
('lh555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'w5555555-5555-5555-5555-555555555555', 6.5, '2024-02-12', 22.00, 'Renovation', false, NOW());

-- Insert more labor hours for realistic compliance calculations
DO $$
DECLARE
    i INTEGER;
    worker_ids UUID[] := ARRAY[
        'w1111111-1111-1111-1111-111111111111',
        'w2222222-2222-2222-2222-222222222222',
        'w3333333-3333-3333-3333-333333333333',
        'w4444444-4444-4444-4444-444444444444',
        'w5555555-5555-5555-5555-555555555555'
    ];
    project_ids UUID[] := ARRAY[
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'ffffffff-ffff-ffff-ffff-ffffffffffff'
    ];
    contractor_ids UUID[] := ARRAY[
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'cccccccc-cccc-cccc-cccc-cccccccccccc'
    ];
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO labor_hours (
            id,
            project_id,
            contractor_id,
            worker_id,
            hours_worked,
            work_date,
            hourly_rate,
            job_category,
            verified,
            created_at
        ) VALUES (
            gen_random_uuid(),
            project_ids[1 + (i % 3)],
            contractor_ids[1 + (i % 3)],
            worker_ids[1 + (i % 5)],
            6.0 + (random() * 4.0), -- 6-10 hours
            CURRENT_DATE - INTERVAL '1 day' * (random() * 90), -- Last 90 days
            20.0 + (random() * 15.0), -- $20-35/hour
            CASE (i % 4)
                WHEN 0 THEN 'Construction'
                WHEN 1 THEN 'Renovation'
                WHEN 2 THEN 'Maintenance'
                ELSE 'Supervision'
            END,
            random() > 0.1, -- 90% verified
            NOW()
        );
    END LOOP;
END $$;

-- Insert sample emails for triage system
INSERT INTO emails (id, sender_email, subject, body, received_at, classification, priority, status, project_id, ai_summary, created_at) VALUES
('em111111-1111-1111-1111-111111111111', 'contractor@acme.com', 'Section 3 Worker Verification Question', 'Hi, I need clarification on the verification process for our new Section 3 workers. Can you provide guidance?', NOW() - INTERVAL '2 hours', 'compliance_inquiry', 'medium', 'unprocessed', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Contractor requesting guidance on Section 3 worker verification procedures', NOW()),
('em222222-2222-2222-2222-222222222222', 'legal@buildco.com', 'Urgent: Compliance Deadline Approaching', 'We have a compliance deadline next week and need to submit our quarterly report. Please advise on requirements.', NOW() - INTERVAL '1 hour', 'deadline_alert', 'high', 'unprocessed', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Urgent request for compliance deadline assistance and quarterly report requirements', NOW()),
('em333333-3333-3333-3333-333333333333', 'worker@email.com', 'Training Session Inquiry', 'When is the next Section 3 training session scheduled? I would like to attend.', NOW() - INTERVAL '30 minutes', 'training_request', 'low', 'unprocessed', NULL, 'Worker inquiry about upcoming Section 3 training session schedule', NOW());

-- Insert contractor registrations
INSERT INTO contractor_registrations (id, company_name, contact_email, contact_phone, business_address, section3_certified, certification_documents, registration_status, created_at) VALUES
('cr111111-1111-1111-1111-111111111111', 'New Build Solutions', 'contact@newbuild.com', '(555) 999-8888', '999 Construction Blvd, Bethesda MD 20814', true, ARRAY['cert_section3_2024.pdf', 'business_license.pdf'], 'pending', NOW()),
('cr222222-2222-2222-2222-222222222222', 'Green Construction Co', 'info@greenconstruction.com', '(555) 888-7777', '777 Eco Way, Silver Spring MD 20910', false, ARRAY['business_license.pdf'], 'approved', NOW());

-- Insert contractor KPIs
INSERT INTO contractor_kpis (id, contractor_id, reporting_period, total_labor_hours, section3_labor_hours, compliance_rate, section3_hires, total_hires, projects_count, created_at) VALUES
('ck111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-Q1', 2400, 840, 35.0, 8, 15, 2, NOW()),
('ck222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-Q1', 1800, 450, 25.0, 5, 12, 1, NOW()),
('ck333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-Q1', 1200, 180, 15.0, 2, 8, 1, NOW());

-- Insert compliance alerts
INSERT INTO compliance_alerts (id, contractor_id, alert_type, title, message, due_date, priority, status, created_at) VALUES
('ca111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'compliance_warning', 'Below Compliance Threshold', 'Your current compliance rate is 15%, which is below the required 25% threshold. Please review your Section 3 hiring practices.', CURRENT_DATE + INTERVAL '7 days', 'high', 'active', NOW()),
('ca222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'report_due', 'Quarterly Report Due', 'Your Q1 2024 compliance report is due in 3 days. Please ensure all data is accurate and submitted on time.', CURRENT_DATE + INTERVAL '3 days', 'medium', 'active', NOW());

-- Insert outreach events
INSERT INTO outreach_events (id, event_type, title, description, event_date, location, participant_count, photos, contractor_id, created_by, created_at) VALUES
('oe111111-1111-1111-1111-111111111111', 'job_fair', 'Spring 2024 Job Fair', 'Community job fair focused on Section 3 opportunities in construction and renovation projects.', '2024-03-15', 'Washington Convention Center', 150, ARRAY['jobfair_photo1.jpg', 'jobfair_photo2.jpg'], 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NOW()),
('oe222222-2222-2222-2222-222222222222', 'training_session', 'Construction Safety Training', 'OSHA-compliant safety training for new Section 3 workers entering construction projects.', '2024-02-28', 'ACME Training Center', 25, ARRAY['training_photo1.jpg'], 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', NOW());

-- Insert best practice templates
INSERT INTO best_practice_templates (id, title, category, description, template_content, tags, is_active, created_by, created_at) VALUES
('bt111111-1111-1111-1111-111111111111', 'Section 3 Job Fair Flyer Template', 'job_fair_flyer', 'Standard template for promoting Section 3 job opportunities', 'JOIN US FOR SECTION 3 OPPORTUNITIES!\n\nDate: [DATE]\nTime: [TIME]\nLocation: [LOCATION]\n\nWe are hiring for:\n- Construction Workers\n- Apprentices\n- Administrative Support\n\nSection 3 residents and businesses encouraged to apply!\n\nContact: [CONTACT_INFO]', ARRAY['recruitment', 'job_fair', 'section3'], true, '11111111-1111-1111-1111-111111111111', NOW()),
('bt222222-2222-2222-2222-222222222222', 'Worker Evaluation Form', 'trainee_evaluation', 'Standardized evaluation form for Section 3 trainees', 'SECTION 3 WORKER EVALUATION\n\nWorker Name: _______________\nProject: _______________\nEvaluation Period: _______________\n\nSkills Assessment:\n□ Excellent □ Good □ Satisfactory □ Needs Improvement\n\nAttendance: _______________\nSafety Compliance: _______________\nTeamwork: _______________\n\nRecommendations:\n_______________', ARRAY['evaluation', 'training', 'performance'], true, '11111111-1111-1111-1111-111111111111', NOW());

-- Insert project locations for geographic mapping
INSERT INTO project_locations (id, project_id, latitude, longitude, address, service_radius_miles, census_tract, poverty_rate, median_income, created_at) VALUES
('pl111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 38.9072, -77.0369, '1000 K Street NW, Washington DC', 5, '11001006202', 18.5, 45000, NOW()),
('pl222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 38.8951, -76.9947, '500 H Street NE, Washington DC', 3, '11001007803', 22.1, 38000, NOW()),
('pl333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 38.8816, -77.0044, '200 M Street SE, Washington DC', 5, '11001009901', 15.3, 52000, NOW());

-- Insert worker addresses for verification
INSERT INTO worker_addresses (id, worker_id, address, latitude, longitude, census_tract, verification_status, distance_to_project, eligibility_confirmed, created_at) VALUES
('wa111111-1111-1111-1111-111111111111', 'w1111111-1111-1111-1111-111111111111', '100 A St SE, Washington DC 20003', 38.8816, -77.0044, '11001009901', 'verified', 2.3, true, NOW()),
('wa222222-2222-2222-2222-222222222222', 'w2222222-2222-2222-2222-222222222222', '200 B St NE, Washington DC 20002', 38.8951, -76.9947, '11001007803', 'verified', 1.8, true, NOW()),
('wa333333-3333-3333-3333-333333333333', 'w3333333-3333-3333-3333-333333333333', '300 C St NW, Washington DC 20001', 38.9072, -77.0369, '11001006202', 'verified', 0.5, true, NOW()),
('wa444444-4444-4444-4444-444444444444', 'w4444444-4444-4444-4444-444444444444', '400 D St SW, Washington DC 20024', 38.8816, -77.0200, '11001010100', 'pending', 3.2, false, NOW());

-- Insert audit logs
INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, created_at) VALUES
('al111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'create', 'project', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '{"name": "Downtown Housing Development", "budget": 2500000}', '192.168.1.100', NOW() - INTERVAL '2 days'),
('al222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'update', 'labor_hours', 'lh111111-1111-1111-1111-111111111111', '{"verified": true, "previous_verified": false}', '192.168.1.101', NOW() - INTERVAL '1 day'),
('al333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'create', 'worker', 'w5555555-5555-5555-5555-555555555555', '{"name": "Michael Davis", "section3_status": true}', '192.168.1.102', NOW() - INTERVAL '6 hours');

-- Insert audit snapshots
INSERT INTO audit_snapshots (id, snapshot_name, snapshot_date, data_summary, created_by, created_at) VALUES
('as111111-1111-1111-1111-111111111111', 'End of Q1 2024', '2024-03-31 23:59:59', '{"total_contractors": 3, "total_projects": 3, "total_labor_hours": 5400, "section3_hours": 1470, "compliance_rate": 27.2}', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days'),
('as222222-2222-2222-2222-222222222222', 'Mid-April 2024', '2024-04-15 12:00:00', '{"total_contractors": 3, "total_projects": 3, "total_labor_hours": 6200, "section3_hours": 1680, "compliance_rate": 27.1}', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '15 days');

-- Insert performance scorecards
INSERT INTO performance_scorecards (id, contractor_id, project_id, scorecard_date, total_hours, section3_hours, compliance_percentage, threshold_met, threshold_type, flags, created_at) VALUES
('ps111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE, 2400, 840, 35.0, true, '25_percent', ARRAY[]::text[], NOW()),
('ps222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', CURRENT_DATE, 1800, 450, 25.0, true, '25_percent', ARRAY[]::text[], NOW()),
('ps333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ffffffff-ffff-ffff-ffff-ffffffffffff', CURRENT_DATE, 1200, 180, 15.0, false, '25_percent', ARRAY['Below compliance threshold', 'Insufficient Section 3 hiring'], NOW());

-- Insert mobile sessions
INSERT INTO mobile_sessions (id, user_id, device_id, device_type, app_version, last_sync, push_token, created_at) VALUES
('ms111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'device_ios_12345', 'ios', '1.2.3', NOW() - INTERVAL '1 hour', 'push_token_ios_12345', NOW() - INTERVAL '7 days'),
('ms222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'device_android_67890', 'android', '1.2.3', NOW() - INTERVAL '30 minutes', 'push_token_android_67890', NOW() - INTERVAL '3 days');

-- Insert offline entries
INSERT INTO offline_entries (id, user_id, entry_type, entry_data, sync_status, created_offline_at, synced_at, created_at) VALUES
('oe111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'labor_hours', '{"worker_id": "w1111111-1111-1111-1111-111111111111", "hours": 8.0, "date": "2024-04-20", "project_id": "dddddddd-dddd-dddd-dddd-dddddddddddd"}', 'synced', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NOW()),
('oe222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'worker_verification', '{"worker_id": "w4444444-4444-4444-4444-444444444444", "verification_status": "verified", "photo_url": "verification_photo.jpg"}', 'pending', NOW() - INTERVAL '30 minutes', NULL, NOW());

-- Insert report schedules
INSERT INTO report_schedules (id, report_type, frequency, format, recipients, next_run, last_run, active, contractor_id, created_at) VALUES
('rs111111-1111-1111-1111-111111111111', 'monthly', 'monthly', 'pdf', ARRAY['admin@hud.gov', 'compliance@hud.gov'], CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 month', true, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW()),
('rs222222-2222-2222-2222-222222222222', 'quarterly', 'quarterly', 'excel', ARRAY['regional@hud.gov'], CURRENT_DATE + INTERVAL '3 months', CURRENT_DATE - INTERVAL '3 months', true, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW());

-- Insert qualitative reports
INSERT INTO qualitative_reports (id, reporting_period, status, due_date, submitted_at, content, contractor_id, created_at) VALUES
('qr111111-1111-1111-1111-111111111111', '2024-Q1', 'submitted', '2024-04-15', '2024-04-10', '{"outreach_events": 2, "training_sessions": 3, "community_partnerships": 1, "narrative": "Successful quarter with strong community engagement"}', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW()),
('qr222222-2222-2222-2222-222222222222', '2024-Q2', 'draft', '2024-07-15', NULL, '{"outreach_events": 1, "training_sessions": 1, "community_partnerships": 0, "narrative": "Work in progress"}', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW());

-- Insert payroll integrations
INSERT INTO payroll_integrations (id, platform, api_credentials, sync_status, last_sync, error_log, contractor_id, created_at) VALUES
('pi111111-1111-1111-1111-111111111111', 'adp', '{"api_key": "encrypted_key_123", "company_id": "ACME001"}', 'completed', NOW() - INTERVAL '2 hours', NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW()),
('pi222222-2222-2222-2222-222222222222', 'quickbooks', '{"api_key": "encrypted_key_456", "company_id": "BUILD002"}', 'error', NOW() - INTERVAL '1 day', 'Authentication failed - invalid API key', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW());

-- Insert CSV uploads
INSERT INTO csv_uploads (id, filename, file_size, rows_processed, rows_successful, rows_failed, status, contractor_id, uploaded_by, completed_at, created_at) VALUES
('cu111111-1111-1111-1111-111111111111', 'labor_hours_march_2024.csv', 15420, 150, 145, 5, 'completed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('cu222222-2222-2222-2222-222222222222', 'worker_data_april_2024.csv', 8930, 75, 75, 0, 'completed', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

-- Insert payroll errors
INSERT INTO payroll_errors (id, error_type, description, resolved, resolved_by, resolved_at, created_at) VALUES
('pe111111-1111-1111-1111-111111111111', 'api_authentication', 'QuickBooks API authentication failed due to expired credentials', false, NULL, NULL, NOW() - INTERVAL '1 day'),
('pe222222-2222-2222-2222-222222222222', 'data_validation', 'Worker ID mismatch in payroll data - worker not found in system', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '3 hours');

-- Insert SPEARS sync logs
INSERT INTO spears_sync_logs (id, sync_type, local_record_id, spears_record_id, sync_status, error_message, request_payload, response_payload, synced_at, created_at) VALUES
('ss111111-1111-1111-1111-111111111111', 'worker_data', 'w1111111-1111-1111-1111-111111111111', 'SPEARS-W-2024-001', 'success', NULL, '{"worker_id": "w1111111-1111-1111-1111-111111111111", "section3_status": true}', '{"status": "success", "spears_id": "SPEARS-W-2024-001"}', NOW() - INTERVAL '1 hour', NOW()),
('ss222222-2222-2222-2222-222222222222', 'compliance_report', 'qr111111-1111-1111-1111-111111111111', 'SPEARS-R-2024-Q1-001', 'success', NULL, '{"report_id": "qr111111-1111-1111-1111-111111111111", "period": "2024-Q1"}', '{"status": "success", "spears_id": "SPEARS-R-2024-Q1-001"}', NOW() - INTERVAL '2 days', NOW());

-- Insert IDIS mappings
INSERT INTO idis_mappings (id, local_project_id, idis_grant_number, idis_activity_id, mapping_status, last_sync, created_at) VALUES
('im111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'B-21-MC-DC-0001', 'ACT-001-HOUSING', 'active', NOW() - INTERVAL '1 day', NOW()),
('im222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'B-21-MC-DC-0002', 'ACT-002-COMMUNITY', 'active', NOW() - INTERVAL '1 day', NOW());

-- Insert HUD sync jobs
INSERT INTO hud_sync_jobs (id, job_type, schedule_cron, last_run, next_run, status, error_count, max_retries, created_at) VALUES
('hj111111-1111-1111-1111-111111111111', 'spears_sync', '0 2 * * *', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'active', 0, 3, NOW()),
('hj222222-2222-2222-2222-222222222222', 'idis_sync', '0 3 * * 0', NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', 'active', 0, 3, NOW()),
('hj333333-3333-3333-3333-333333333333', 'compliance_report', '0 1 1 * *', NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days', 'active', 0, 3, NOW());

-- Insert support tickets
INSERT INTO support_tickets (id, ticket_number, user_id, category, priority, status, subject, description, assigned_to, resolution, resolved_at, created_at) VALUES
('st111111-1111-1111-1111-111111111111', 'TKT-001234', '22222222-2222-2222-2222-222222222222', 'technical', 'medium', 'resolved', 'Unable to sync payroll data', 'Getting error when trying to sync ADP payroll data. Connection seems to timeout.', '11111111-1111-1111-1111-111111111111', 'Issue resolved by updating API credentials and increasing timeout settings.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days'),
('st222222-2222-2222-2222-222222222222', 'TKT-001235', '33333333-3333-3333-3333-333333333333', 'training', 'low', 'open', 'Question about Section 3 requirements', 'Need clarification on the 25% vs 5% thresholds for different project types.', NULL, NULL, NULL, NOW() - INTERVAL '2 hours');

-- Insert knowledge base articles
INSERT INTO knowledge_base_articles (id, title, content, category, tags, view_count, is_published, created_by, created_at) VALUES
('kb111111-1111-1111-1111-111111111111', 'Understanding Section 3 Thresholds', 'Section 3 requirements vary based on project type and funding amount. For projects over $200,000, contractors must meet a 25% labor hour threshold for Section 3 workers...', 'compliance', ARRAY['section3', 'thresholds', 'compliance'], 45, true, '11111111-1111-1111-1111-111111111111', NOW()),
('kb222222-2222-2222-2222-222222222222', 'Mobile App Quick Start Guide', 'Getting started with the Section 3 mobile app: 1. Download from app store 2. Login with your credentials 3. Enable offline mode...', 'technical', ARRAY['mobile', 'quickstart', 'tutorial'], 23, true, '11111111-1111-1111-1111-111111111111', NOW());

-- Insert user training progress
INSERT INTO user_training_progress (id, user_id, module_id, status, progress_percentage, started_at, completed_at, score, created_at) VALUES
('ut111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', (SELECT id FROM training_modules WHERE module_name = 'Section 3 Basics' LIMIT 1), 'completed', 100, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week', 85, NOW()),
('ut222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', (SELECT id FROM training_modules WHERE module_name = 'Mobile App Usage' LIMIT 1), 'in_progress', 60, NOW() - INTERVAL '3 days', NULL, NULL, NOW());

-- Insert pilot participants
INSERT INTO pilot_participants (id, organization_name, organization_type, region, contact_person, contact_email, pilot_start_date, pilot_end_date, status, feedback_score, created_at) VALUES
('pp111111-1111-1111-1111-111111111111', 'DC Housing Authority', 'development_authority', 'urban', 'Sarah Johnson', 'sarah.johnson@dchousing.org', '2024-01-01', '2024-06-30', 'active', NULL, NOW()),
('pp222222-2222-2222-2222-222222222222', 'Baltimore County HUD Office', 'hud_office', 'suburban', 'Michael Brown', 'michael.brown@hud.gov', '2024-02-01', '2024-07-31', 'active', NULL, NOW());

-- Insert usage analytics
INSERT INTO usage_analytics (id, user_id, action, module, session_duration, error_details, timestamp, ip_address, user_agent) VALUES
('ua111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'login', 'authentication', 0, NULL, NOW() - INTERVAL '2 hours', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('ua222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'report_submission', 'qualitative_reporting', 1800, NULL, NOW() - INTERVAL '1 hour', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('ua333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'data_entry', 'labor_hours', 600, NULL, NOW() - INTERVAL '30 minutes', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15');

-- Update sequences to ensure proper ID generation
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
