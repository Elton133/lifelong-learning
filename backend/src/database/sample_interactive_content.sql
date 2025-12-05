-- Sample data for testing interactive demos and text content

-- Insert sample text content
INSERT INTO learning_content (
  title,
  description,
  content_type,
  difficulty,
  estimated_duration,
  category,
  content_data,
  xp_reward
) VALUES (
  'Introduction to React Hooks',
  'Learn the fundamentals of React Hooks with this comprehensive reading material',
  'text',
  'beginner',
  10,
  'programming',
  '{
    "text_content": {
      "content_type": "passage",
      "reading_time": 10,
      "sections": [
        {
          "id": "section1",
          "title": "What are React Hooks?",
          "content": "React Hooks are functions that let you use state and other React features without writing a class. They were introduced in React 16.8 and have become the standard way to write React components.\n\nHooks solve many problems that developers faced with class components, including:\n- Complex components that are hard to understand\n- Reusing stateful logic between components\n- Complicated lifecycle methods\n\nThe most commonly used hooks are useState and useEffect, which allow you to add state and side effects to functional components.",
          "order": 1
        },
        {
          "id": "section2",
          "title": "The useState Hook",
          "content": "The useState hook is the most basic hook and allows you to add state to functional components.\n\nSyntax:\nconst [state, setState] = useState(initialValue);\n\nExample:\nconst [count, setCount] = useState(0);\n\nThe useState hook returns an array with two elements:\n1. The current state value\n2. A function to update that value\n\nWhen you call the update function, React will re-render your component with the new state value.",
          "order": 2
        },
        {
          "id": "section3",
          "title": "The useEffect Hook",
          "content": "The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in class components.\n\nSyntax:\nuseEffect(() => {\n  // Your side effect code here\n  return () => {\n    // Cleanup code (optional)\n  };\n}, [dependencies]);\n\nCommon use cases:\n- Fetching data from an API\n- Setting up subscriptions\n- Manually changing the DOM\n- Logging\n\nThe dependency array controls when the effect runs. An empty array means it runs once on mount, while including variables means it runs when those variables change.",
          "order": 3
        }
      ]
    }
  }'::jsonb,
  50
);

-- Insert sample code demo content
INSERT INTO learning_content (
  title,
  description,
  content_type,
  difficulty,
  estimated_duration,
  category,
  content_data,
  xp_reward
) VALUES (
  'JavaScript Array Methods Practice',
  'Practice using JavaScript array methods with hands-on coding exercises',
  'interactive',
  'intermediate',
  15,
  'programming',
  '{
    "demo_config": {
      "demo_type": "code",
      "code_demo": {
        "language": "javascript",
        "instructions": "Complete the function that filters an array of numbers to return only even numbers. Use the array filter method to accomplish this task.",
        "starter_code": "function getEvenNumbers(numbers) {\n  // Your code here\n  return numbers.filter(/* complete this */);\n}\n\n// Test your function\nconst numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconsole.log(getEvenNumbers(numbers));",
        "solution_code": "function getEvenNumbers(numbers) {\n  return numbers.filter(num => num % 2 === 0);\n}\n\nconst numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconsole.log(getEvenNumbers(numbers));",
        "test_cases": [
          {
            "id": "test1",
            "input": "[1, 2, 3, 4, 5, 6]",
            "expected_output": "[2, 4, 6]",
            "description": "Filter even numbers from array"
          },
          {
            "id": "test2",
            "input": "[10, 15, 20, 25]",
            "expected_output": "[10, 20]",
            "description": "Filter even numbers from mixed array"
          }
        ],
        "hints": [
          {
            "id": "hint1",
            "level": 1,
            "content": "Think about what makes a number even. How can you check if a number is divisible by 2?"
          },
          {
            "id": "hint2",
            "level": 2,
            "content": "Use the modulo operator (%) to check if a number is even. If num % 2 === 0, the number is even."
          },
          {
            "id": "hint3",
            "level": 3,
            "content": "The complete solution is: numbers.filter(num => num % 2 === 0)"
          }
        ]
      }
    }
  }'::jsonb,
  75
);

-- Insert sample video demo with interactive moments
INSERT INTO learning_content (
  title,
  description,
  content_type,
  difficulty,
  estimated_duration,
  category,
  content_data,
  xp_reward
) VALUES (
  'Git Basics - Interactive Video Tutorial',
  'Learn Git basics with interactive quizzes embedded in the video',
  'interactive',
  'beginner',
  20,
  'programming',
  '{
    "demo_config": {
      "demo_type": "video",
      "video_demo": {
        "video_url": "https://www.youtube.com/watch?v=8JJ101D3knE",
        "allow_speed_control": true,
        "interactive_moments": [
          {
            "timestamp": 120,
            "type": "quiz",
            "quiz_question": {
              "id": "q1",
              "question": "What is the command to initialize a new Git repository?",
              "options": [
                "git start",
                "git init",
                "git create",
                "git new"
              ],
              "correct_answer": 1,
              "explanation": "git init is the command used to initialize a new Git repository in the current directory."
            }
          },
          {
            "timestamp": 240,
            "type": "tip",
            "tip_content": "Pro tip: Always write meaningful commit messages that describe what changes you made and why. This helps your team understand the project history."
          },
          {
            "timestamp": 360,
            "type": "quiz",
            "quiz_question": {
              "id": "q2",
              "question": "Which command stages all changes for commit?",
              "options": [
                "git commit -a",
                "git add .",
                "git stage all",
                "git push"
              ],
              "correct_answer": 1,
              "explanation": "git add . stages all changes in the current directory and subdirectories for the next commit."
            }
          }
        ]
      }
    }
  }'::jsonb,
  100
);

-- Insert sample drag and drop demo
INSERT INTO learning_content (
  title,
  description,
  content_type,
  difficulty,
  estimated_duration,
  category,
  content_data,
  xp_reward
) VALUES (
  'Agile Workflow Stages',
  'Arrange the stages of an Agile development workflow in the correct order',
  'interactive',
  'beginner',
  8,
  'leadership',
  '{
    "demo_config": {
      "demo_type": "drag-drop",
      "drag_drop_demo": {
        "title": "Organize Agile Workflow Stages",
        "description": "Drag and drop the following stages into their correct workflow positions",
        "validation_type": "on-submit",
        "elements": [
          {
            "id": "backlog",
            "content": "Product Backlog",
            "type": "text"
          },
          {
            "id": "sprint-planning",
            "content": "Sprint Planning",
            "type": "text"
          },
          {
            "id": "daily-standup",
            "content": "Daily Standup",
            "type": "text"
          },
          {
            "id": "sprint-review",
            "content": "Sprint Review",
            "type": "text"
          },
          {
            "id": "retrospective",
            "content": "Sprint Retrospective",
            "type": "text"
          }
        ],
        "drop_zones": [
          {
            "id": "stage1",
            "label": "Stage 1: Planning",
            "max_items": 2
          },
          {
            "id": "stage2",
            "label": "Stage 2: Execution",
            "max_items": 1
          },
          {
            "id": "stage3",
            "label": "Stage 3: Review & Reflection",
            "max_items": 2
          }
        ],
        "correct_mappings": {
          "backlog": "stage1",
          "sprint-planning": "stage1",
          "daily-standup": "stage2",
          "sprint-review": "stage3",
          "retrospective": "stage3"
        }
      }
    }
  }'::jsonb,
  60
);

-- Insert sample sandbox environment
INSERT INTO learning_content (
  title,
  description,
  content_type,
  difficulty,
  estimated_duration,
  category,
  content_data,
  xp_reward
) VALUES (
  'Python Sandbox - Free Coding Environment',
  'Experiment with Python code in a free sandbox environment',
  'sandbox',
  'beginner',
  30,
  'programming',
  '{
    "sandbox_config": {
      "language": "python",
      "starter_code": "# Welcome to the Python Sandbox!\n# Write any Python code you want to experiment with\n\ndef greet(name):\n    return f\"Hello, {name}!\"\n\n# Try calling the function\nprint(greet(\"World\"))\n\n# Your code here...",
      "solution": "",
      "tests": []
    }
  }'::jsonb,
  40
);
