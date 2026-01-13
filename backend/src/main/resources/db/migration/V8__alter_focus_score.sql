-- Change focus_score from INT to DOUBLE PRECISION
ALTER TABLE telemetry_events 
ALTER COLUMN focus_score TYPE DOUBLE PRECISION;
