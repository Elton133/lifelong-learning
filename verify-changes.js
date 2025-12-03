#!/usr/bin/env node

/**
 * Verification script for user registration and onboarding improvements
 * 
 * This script verifies that:
 * 1. TypeScript types are correctly defined
 * 2. Database schema changes are reflected in types
 * 3. API functions support new fields
 * 
 * Run with: node verify-changes.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying implementation changes...\n');

let allPassed = true;

// Test 1: Check if types/database.ts includes interests field
console.log('Test 1: Checking Profile type includes interests field...');
const typesPath = path.join(__dirname, 'types', 'database.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');

if (typesContent.includes('interests: string[] | null;')) {
  console.log('✅ Profile type includes interests field\n');
} else {
  console.log('❌ Profile type missing interests field\n');
  allPassed = false;
}

// Test 2: Check if LearningContent type includes category field
console.log('Test 2: Checking LearningContent type includes category field...');
if (typesContent.includes('category: string | null;')) {
  console.log('✅ LearningContent type includes category field\n');
} else {
  console.log('❌ LearningContent type missing category field\n');
  allPassed = false;
}

// Test 3: Check if learning_style includes 'audio' option
console.log('Test 3: Checking learning_style includes audio option...');
if (typesContent.includes("'audio'")) {
  console.log('✅ learning_style includes audio option\n');
} else {
  console.log('❌ learning_style missing audio option\n');
  allPassed = false;
}

// Test 4: Check database schema has interests field
console.log('Test 4: Checking database schema includes interests field...');
const schemaPath = path.join(__dirname, 'backend', 'src', 'database', 'schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

if (schemaContent.includes("interests TEXT[] DEFAULT '{}'")) {
  console.log('✅ Database schema includes interests field\n');
} else {
  console.log('❌ Database schema missing interests field\n');
  allPassed = false;
}

// Test 5: Check database schema has category field
console.log('Test 5: Checking database schema includes category field...');
if (schemaContent.includes('category TEXT')) {
  console.log('✅ Database schema includes category field\n');
} else {
  console.log('❌ Database schema missing category field\n');
  allPassed = false;
}

// Test 6: Check handle_new_user saves role and department
console.log('Test 6: Checking handle_new_user function saves role and department...');
if (schemaContent.includes("new.raw_user_meta_data->>'role'") && 
    schemaContent.includes("new.raw_user_meta_data->>'department'")) {
  console.log('✅ handle_new_user function saves role and department\n');
} else {
  console.log('❌ handle_new_user function not properly configured\n');
  allPassed = false;
}

// Test 7: Check onboarding page saves to database
console.log('Test 7: Checking onboarding page saves data to database...');
const onboardingPath = path.join(__dirname, 'app', '(auth)', 'onboarding', 'page.tsx');
const onboardingContent = fs.readFileSync(onboardingPath, 'utf8');

if (onboardingContent.includes(".from('profiles')") &&
    onboardingContent.includes('.update({') &&
    onboardingContent.includes('interests:') &&
    onboardingContent.includes('career_goals:') &&
    onboardingContent.includes('learning_style:')) {
  console.log('✅ Onboarding page saves data to database\n');
} else {
  console.log('❌ Onboarding page not properly configured\n');
  allPassed = false;
}

// Test 8: Check content routes support category filtering
console.log('Test 8: Checking content routes support category filtering...');
const contentRoutesPath = path.join(__dirname, 'backend', 'src', 'routes', 'content.routes.ts');
const contentRoutesContent = fs.readFileSync(contentRoutesPath, 'utf8');

if (contentRoutesContent.includes('category') && 
    contentRoutesContent.includes("query.eq('category', category)")) {
  console.log('✅ Content routes support category filtering\n');
} else {
  console.log('❌ Content routes missing category filtering\n');
  allPassed = false;
}

// Test 9: Check API supports category filtering
console.log('Test 9: Checking frontend API supports category filtering...');
const apiPath = path.join(__dirname, 'lib', 'api.ts');
const apiContent = fs.readFileSync(apiPath, 'utf8');

if (apiContent.includes('category?: string') && 
    apiContent.includes("filters?.category")) {
  console.log('✅ Frontend API supports category filtering\n');
} else {
  console.log('❌ Frontend API missing category filtering\n');
  allPassed = false;
}

// Test 10: Check playlist generation uses interests
console.log('Test 10: Checking playlist generation filters by interests...');
if (apiContent.includes('interests') && 
    apiContent.includes("query.in('category', userInterests)")) {
  console.log('✅ Playlist generation filters by user interests\n');
} else {
  console.log('❌ Playlist generation not using interests\n');
  allPassed = false;
}

// Test 11: Check migrations exist
console.log('Test 11: Checking migration files exist...');
const migration1Path = path.join(__dirname, 'backend', 'src', 'database', 'migrations', '001_add_interests_and_category.sql');
const migration2Path = path.join(__dirname, 'backend', 'src', 'database', 'migrations', '002_update_handle_new_user_function.sql');

if (fs.existsSync(migration1Path) && fs.existsSync(migration2Path)) {
  console.log('✅ Migration files exist\n');
} else {
  console.log('❌ Migration files missing\n');
  allPassed = false;
}

// Test 12: Check seed data includes categories
console.log('Test 12: Checking seed data includes categories...');
const seedPath = path.join(__dirname, 'backend', 'src', 'database', 'seed.sql');
const seedContent = fs.readFileSync(seedPath, 'utf8');

if (seedContent.includes("'programming'") && 
    seedContent.includes("'leadership'") &&
    seedContent.includes("'technology'")) {
  console.log('✅ Seed data includes categories\n');
} else {
  console.log('❌ Seed data missing categories\n');
  allPassed = false;
}

// Final result
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (allPassed) {
  console.log('✅ All verification tests passed!');
  console.log('\nThe implementation is complete and all changes are in place.');
  console.log('Next steps:');
  console.log('1. Apply migrations to your Supabase database');
  console.log('2. Test the registration and onboarding flow');
  console.log('3. Verify playlists are filtered by user interests');
  process.exit(0);
} else {
  console.log('❌ Some verification tests failed');
  console.log('Please review the failed tests above');
  process.exit(1);
}
