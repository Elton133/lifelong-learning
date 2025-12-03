# User Registration and Onboarding Improvements

This document describes the changes made to improve user registration and onboarding, addressing the issues outlined in the problem statement.

## Problem Statement Summary

1. **Registration Issues**: When users register, their role, seniority level, learning style, and career goals were not being sent to the database
2. **Missing Interests Field**: User interests needed to be saved to generate personalized playlists
3. **Content Filtering**: Learning content needed category support to filter playlists based on user preferences
4. **Empty Skills Section**: User skills section starts empty (will be populated as users complete learning content)

## Solutions Implemented

### 1. Database Schema Updates

#### Profiles Table
- **Added `interests` field**: `TEXT[]` array to store user interests/categories
- **Updated `learning_style` constraint**: Added 'audio' as an additional learning style option
- **Existing fields preserved**: `role`, `seniority_level`, `learning_style`, `career_goals` were already in the schema

#### Learning Content Table
- **Added `category` field**: `TEXT` field to categorize content (e.g., 'programming', 'photography', 'finance', 'leadership')
- This enables filtering content based on user interests

#### Database Functions
- **Updated `handle_new_user()` trigger**: Now saves `role` and `department` from user metadata during registration

### 2. Type System Updates

Updated TypeScript interfaces in `types/database.ts`:

```typescript
export interface Profile {
  // ... existing fields
  interests: string[] | null;  // NEW: User interests
  learning_style: 'visual' | 'hands-on' | 'reading' | 'video' | 'audio' | null;  // UPDATED: Added 'audio'
}

export interface LearningContent {
  // ... existing fields
  category: string | null;  // NEW: Content category for filtering
}
```

### 3. Registration Flow

The signup flow at `/app/(auth)/signup/page.tsx` already collects:
- ✅ Full name
- ✅ Email
- ✅ Password
- ✅ Role
- ✅ Department

The `useAuth` hook properly passes this metadata to Supabase Auth, which then triggers the `handle_new_user()` function to create the profile with role and department.

### 4. Onboarding Flow Improvements

The onboarding page at `/app/(auth)/onboarding/page.tsx` now:

1. **Collects user preferences**:
   - Interests (minimum 3 from 16 categories)
   - Learning goals (career advancement, hobbies, etc.)
   - Learning style (visual, hands-on, reading, audio)
   - Daily time commitment

2. **Saves to database** via Supabase:
   ```typescript
   await supabase
     .from('profiles')
     .update({
       interests: selectedInterests,
       career_goals: careerGoals,
       learning_style: selectedStyle,
     })
     .eq('id', user.id);
   ```

3. **Saves to localStorage** for immediate use before page reload

### 5. Content Filtering by Category

#### Backend API (`/backend/src/routes/content.routes.ts`)
- Added `category` query parameter support
- Example: `GET /api/content?category=programming`

#### Frontend API (`/lib/api.ts`)
- Added category filtering to `contentAPI.getAll()`
- Updated playlist generation to filter by user interests:
  ```typescript
  const userInterests = profile?.interests || [];
  if (userInterests.length > 0) {
    query = query.in('category', userInterests);
  }
  ```

### 6. Personalized Playlist Generation

The playlist generation now considers:
1. **User interests** (primary filter) - only shows content matching user's selected interests
2. **User skills** - prioritizes content for skills with lower mastery levels
3. **Learning style** - prefers content types matching user's learning style
4. **Time commitment** - filters content by estimated duration

Example: A user interested in "photography" will see photography-related quizzes, videos, and interactive content, not coding tutorials.

## Migration Path

### For New Databases
Run the complete schema file:
```bash
backend/src/database/schema.sql
backend/src/database/seed.sql
```

### For Existing Databases
Apply migrations in order:
1. `backend/src/database/migrations/001_add_interests_and_category.sql`
2. `backend/src/database/migrations/002_update_handle_new_user_function.sql`

## Data Flow

### Registration Flow
```
1. User fills signup form → /app/(auth)/signup/page.tsx
2. useAuth.signUp() called with metadata { full_name, role, department }
3. Supabase Auth creates user with metadata
4. handle_new_user() trigger creates profile with role & department
5. User redirected to /onboarding
```

### Onboarding Flow
```
1. User selects interests, goals, style, time → /app/(auth)/onboarding/page.tsx
2. Data saved to Supabase profiles table
3. Data saved to localStorage for immediate use
4. User redirected to main app
```

### Content Discovery Flow
```
1. User navigates to playlists
2. System generates playlist based on:
   - User interests (filters by category)
   - User skills (prioritizes low-mastery skills)
   - Learning style (prefers matching content types)
   - Time commitment (filters by duration)
3. Only relevant content shown (e.g., photography content for photography enthusiasts)
```

## Future Enhancements

### Skills Section
Currently empty for new users, skills will be automatically populated as users:
- Complete learning content (skill IDs in learning_content.skill_ids)
- Achieve certain performance scores
- Practice regularly

The `user_skills` table tracks:
- `mastery_level`: 0-100, increases with practice
- `practice_count`: Number of times practiced
- `last_practiced`: Timestamp of last practice
- `growth_velocity`: Rate of improvement

### AI-Suggested Content
While the database contains manually added content, the system can be extended to:
- Use AI to suggest YouTube videos based on user interests
- Generate personalized learning paths
- Recommend external resources

### External Data Sources
The system can integrate external content:
- YouTube API for video suggestions
- Course platforms APIs (Coursera, Udemy, etc.)
- Technical blogs and documentation
- All filtered by user interests and preferences

## Testing Checklist

To verify the implementation:

- [ ] New user registration saves role and department
- [ ] Onboarding saves interests, goals, and learning style to database
- [ ] User profile shows interests array in database
- [ ] Learning content has category field populated
- [ ] Playlists only show content matching user interests
- [ ] Photography enthusiast sees photography content, not coding content
- [ ] Finance-minded user sees finance content, not photography content
- [ ] Skills section exists but starts empty for new users
- [ ] Skills populate after completing learning content

## Key Files Modified

1. `backend/src/database/schema.sql` - Database schema updates
2. `backend/src/database/seed.sql` - Added categories to seed data
3. `types/database.ts` - TypeScript type updates
4. `app/(auth)/onboarding/page.tsx` - Save onboarding data to database
5. `backend/src/routes/content.routes.ts` - Category filtering support
6. `lib/api.ts` - Content filtering and playlist generation improvements

## Additional Notes

- **Security**: All database operations respect Row Level Security (RLS) policies
- **Backward Compatibility**: Existing users won't be affected, new fields are nullable
- **Performance**: Category filtering uses indexed queries for fast content discovery
- **Scalability**: The interests array supports multiple categories without schema changes
