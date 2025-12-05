-- Migration: Add 'text' content type to learning_content
-- This adds support for text passages and PDF documents

-- Update the content_type check constraint to include 'text'
ALTER TABLE learning_content 
DROP CONSTRAINT IF EXISTS learning_content_content_type_check;

ALTER TABLE learning_content 
ADD CONSTRAINT learning_content_content_type_check 
CHECK (content_type IN ('video', 'interactive', 'scenario', 'sandbox', 'quiz', 'text'));
