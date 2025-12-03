-- Migration: Add interests field to profiles and category field to learning_content
-- Run this SQL in your Supabase SQL Editor to update existing databases

-- Add interests field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add category field to learning_content table
ALTER TABLE learning_content ADD COLUMN IF NOT EXISTS category TEXT;

-- Update learning_style constraint to include 'audio' option
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_learning_style_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_learning_style_check 
  CHECK (learning_style IN ('visual', 'hands-on', 'reading', 'video', 'audio'));

-- Add comment to explain the category field
COMMENT ON COLUMN learning_content.category IS 'Category for filtering content (e.g., technology, photography, finance, programming, leadership)';
COMMENT ON COLUMN profiles.interests IS 'Array of user interests/categories for personalized content filtering';
