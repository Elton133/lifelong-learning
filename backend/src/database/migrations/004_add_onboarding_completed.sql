-- Add onboarding_completed field to profiles table
-- This tracks whether a user has completed the initial onboarding flow

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to mark as onboarded (if they have interests or career_goals set)
UPDATE profiles 
SET onboarding_completed = TRUE 
WHERE (interests IS NOT NULL AND array_length(interests, 1) > 0) 
   OR (career_goals IS NOT NULL AND career_goals::text != '[]');
