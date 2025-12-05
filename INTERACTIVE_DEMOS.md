# Interactive Demo and Sandbox Features

This document describes the new interactive learning features added to the Lifelong Learning Platform.

## Overview

The platform now supports five types of interactive learning experiences:
1. **Interactive Video Demos** - Videos with embedded quizzes and tips
2. **Code Demos** - Hands-on coding exercises with tests and hints
3. **Drag & Drop Demos** - Interactive simulations for workflows and processes
4. **Text Content** - Reading materials with sections and PDF support
5. **Sandbox Environments** - Free-form coding environments for experimentation

## Content Types

### 1. Text Content (`content_type: 'text'`)

Text content allows users to read passages or view PDF documents. Perfect for detailed explanations, documentation, or articles.

**Features:**
- Sectioned reading with progress tracking
- PDF viewer support
- Reading time estimation
- Section navigation
- Completion tracking based on time spent

**Content Data Structure:**
```typescript
{
  text_content: {
    content_type: 'passage' | 'pdf',
    text_passage?: string,
    pdf_url?: string,
    sections?: [
      {
        id: string,
        title: string,
        content: string,
        order: number
      }
    ],
    reading_time?: number
  }
}
```

**Example Use Cases:**
- Technical documentation
- Concept explanations
- Research papers
- Best practice guides

### 2. Interactive Video Demos (`demo_type: 'video'`)

Videos with interactive moments that pause at key points for quizzes or display tips.

**Features:**
- Pause at specific timestamps for interaction
- Embedded quiz questions
- Pro tips and highlights
- Speed controls (0.5x, 1x, 1.5x, 2x)
- Caption support
- Progress tracking

**Content Data Structure:**
```typescript
{
  demo_config: {
    demo_type: 'video',
    video_demo: {
      video_url: string,
      allow_speed_control?: boolean,
      captions_url?: string,
      interactive_moments?: [
        {
          timestamp: number,
          type: 'quiz' | 'tip' | 'highlight',
          quiz_question?: QuizQuestion,
          tip_content?: string
        }
      ]
    }
  }
}
```

**Scoring:**
- 70% based on quiz answers at interactive moments
- 30% for watching at least 75% of the video

**Example Use Cases:**
- Code-along tutorials
- Product demonstrations
- Lecture-style teaching
- Step-by-step guides

### 3. Code Demos (`demo_type: 'code'`)

Hands-on coding exercises with instant feedback.

**Features:**
- In-browser code editor
- Multiple test cases
- Progressive hints system (reduces score)
- Attempt tracking
- Syntax highlighting
- Reset functionality

**Content Data Structure:**
```typescript
{
  demo_config: {
    demo_type: 'code',
    code_demo: {
      language: string,
      instructions: string,
      starter_code: string,
      solution_code: string,
      test_cases?: [
        {
          id: string,
          input: string,
          expected_output: string,
          description: string
        }
      ],
      hints?: [
        {
          id: string,
          level: number,
          content: string
        }
      ]
    }
  }
}
```

**Scoring:**
- Base score: percentage of tests passed
- Penalties: -10 for >3 attempts, -5 per hint used
- Minimum score: 0

**Example Use Cases:**
- Algorithm practice
- Language learning exercises
- Debugging challenges
- Code refactoring tasks

### 4. Drag & Drop Demos (`demo_type: 'drag-drop'`)

Interactive simulations where users drag elements into correct positions.

**Features:**
- Visual drag-and-drop interface
- Zone validation (immediate or on-submit)
- Maximum items per zone
- Type restrictions
- Attempt tracking
- Real-time feedback

**Content Data Structure:**
```typescript
{
  demo_config: {
    demo_type: 'drag-drop',
    drag_drop_demo: {
      title: string,
      description: string,
      validation_type: 'immediate' | 'on-submit',
      elements: [
        {
          id: string,
          content: string,
          type: 'text' | 'image' | 'icon',
          image_url?: string,
          icon_name?: string
        }
      ],
      drop_zones: [
        {
          id: string,
          label: string,
          accepts?: string[],
          max_items?: number
        }
      ],
      correct_mappings: {
        [elementId: string]: dropZoneId
      }
    }
  }
}
```

**Scoring:**
- Base score: percentage of correct mappings
- Penalty: -5 per attempt after the 2nd attempt
- Minimum score: 0

**Example Use Cases:**
- Workflow organization
- Concept categorization
- UI layout design
- Process ordering

### 5. Sandbox Environments (`content_type: 'sandbox'`)

Free-form coding environments for experimentation and learning.

**Features:**
- Full code editor with syntax highlighting
- Code execution (simulated)
- Optional test cases
- Download code functionality
- No time limits
- Encourages exploration

**Content Data Structure:**
```typescript
{
  sandbox_config: {
    language: string,
    starter_code: string,
    solution: string,
    tests: string[]
  }
}
```

**Scoring:**
- 50 points: minimum for not running code
- 100 points: running code + passing tests
- Bonus: +10 for spending >5 minutes

**Example Use Cases:**
- Language exploration
- API testing
- Algorithm experimentation
- Proof of concepts

## Common Features

### Fullscreen Mode

All interactive demos support fullscreen mode with a toggle button:
- Click "Fullscreen" to expand
- Click "Exit Fullscreen" to collapse
- State persists during interaction

### Progress Tracking

Each demo type tracks:
- Completion status
- Performance score (0-100)
- Time spent
- Attempts made

### Replay Functionality

Most demos support replay:
- "Replay" button appears after first completion
- Resets all state
- Allows unlimited practice

## Implementation

### Adding New Content

1. **Choose the content type** based on learning objectives
2. **Prepare content data** following the structure above
3. **Insert into database** using the learning_content table
4. **Test the experience** in the learn page

### Database Migration

Run the migration to add text content type support:
```sql
-- backend/src/database/migrations/005_add_text_content_type.sql
ALTER TABLE learning_content 
DROP CONSTRAINT IF EXISTS learning_content_content_type_check;

ALTER TABLE learning_content 
ADD CONSTRAINT learning_content_content_type_check 
CHECK (content_type IN ('video', 'interactive', 'scenario', 'sandbox', 'quiz', 'text'));
```

### Sample Data

Import sample content to test features:
```bash
psql your_database < backend/src/database/sample_interactive_content.sql
```

## Component Architecture

```
components/learning/
├── InteractiveDemoPlayer.tsx    # Main wrapper with fullscreen
├── VideoDemoPlayer.tsx          # Video with interactive moments
├── CodeDemoPlayer.tsx           # Code editor with tests
├── DragDropDemoPlayer.tsx       # Drag & drop interface
├── TextContentReader.tsx        # Text/PDF reader
└── SandboxEnvironment.tsx       # Free coding environment
```

### Integration in Learn Page

The learn page (`app/dashboard/learn/[contentId]/page.tsx`) automatically routes to the correct player based on `content_type` and demo configuration.

## User Experience Guidelines

### For Video Demos
- Keep interactive moments spaced out (>60 seconds apart)
- Use quizzes for key concepts
- Use tips for best practices
- Limit to 3-5 interactions per video

### For Code Demos
- Start with clear, achievable tasks
- Provide 2-3 progressive hints
- Include edge cases in tests
- Keep starter code minimal

### For Drag & Drop
- Limit elements to 5-8 items
- Use clear, distinct labels
- Provide visual feedback
- Consider color coding

### For Text Content
- Break into 3-5 sections
- Keep sections <500 words
- Use clear headings
- Estimate reading time accurately

### For Sandboxes
- Provide interesting starter code
- Include helpful comments
- Optional: Add suggested challenges
- Allow complete freedom

## Analytics

Track the following metrics:
- Completion rate by demo type
- Average score by demo type
- Time spent per demo type
- Most replayed demos
- Hint usage patterns
- Drop-off points in videos

## Future Enhancements

Potential additions:
- [ ] Live code execution with real sandboxes
- [ ] Collaborative coding sessions
- [ ] AI-powered hint generation
- [ ] Adaptive difficulty adjustment
- [ ] Social sharing of code solutions
- [ ] Community-contributed content
- [ ] Video recording capability
- [ ] Multi-step drag & drop workflows

## Troubleshooting

### Demo not loading
- Check content_data structure matches expected schema
- Verify all required fields are present
- Check browser console for errors

### Fullscreen not working
- Ensure component is properly wrapped
- Check browser security settings
- Test in different browsers

### Score not tracking
- Verify handleComplete callback is called
- Check API endpoint connection
- Review session completion logic

## Support

For questions or issues:
1. Check this documentation
2. Review component source code
3. Test with sample data
4. Check browser console for errors
