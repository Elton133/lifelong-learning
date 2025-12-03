# Database Migrations

This folder contains SQL migration scripts to update existing Supabase databases with new features.

## How to Apply Migrations

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run each migration file in order (numbered sequentially)
4. Verify the changes were applied successfully

## Migration Files

### 001_add_interests_and_category.sql
Adds the `interests` field to the `profiles` table and the `category` field to the `learning_content` table. Also updates the learning_style constraint to include 'audio'.

**Required for:** User interest tracking and content filtering by category

### 002_update_handle_new_user_function.sql
Updates the `handle_new_user()` trigger function to save `role` and `department` from user metadata when a new user signs up.

**Required for:** Proper user registration with role and department

## Notes

- These migrations are idempotent where possible (using `IF NOT EXISTS`)
- Always backup your database before running migrations
- Test migrations in a development environment first
- If you're setting up a fresh database, use `schema.sql` instead of these migrations
