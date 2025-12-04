-- Migration: Add daily_learning_time field to profiles table
-- This field stores the user's daily learning time goal in minutes

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_learning_time INTEGER DEFAULT 30;

-- Add comment to the column
COMMENT ON COLUMN profiles.daily_learning_time IS 'Daily learning time goal in minutes (default 30)';
