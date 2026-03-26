
-- Add log_date column to timesheets for daily tracking
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS log_date date;

-- Drop the old unique constraint (weekly-based)
DO $$
BEGIN
  -- Find and drop the existing unique constraint on client_id,candidate_id,financial_week,financial_year
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.timesheets'::regclass 
    AND contype = 'u'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.timesheets DROP CONSTRAINT ' || conname
      FROM pg_constraint 
      WHERE conrelid = 'public.timesheets'::regclass 
      AND contype = 'u'
      LIMIT 1
    );
  END IF;
END $$;

-- Create new unique constraint for daily timesheets
ALTER TABLE public.timesheets ADD CONSTRAINT timesheets_daily_unique 
  UNIQUE (client_id, candidate_id, log_date);
