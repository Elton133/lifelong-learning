'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CodeDemoConfig } from '@/types/database';

interface CodeDemoPlayerProps {
  config: CodeDemoConfig;
  onComplete: (score: number) => void;
  isFullscreen: boolean;
}

export default function CodeDemoPlayer({
  config,
  onComplete,
  isFullscreen,
}: CodeDemoPlayerProps) {
  const [code, setCode] = useState(config.starter_code);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [showHints, setShowHints] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('Running tests...\n');
    setAttempts((prev) => prev + 1);

    // Simulate code execution (in a real app, this would use a sandboxed environment)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Run test cases
    const results: { [key: string]: boolean } = {};
    let passed = 0;
    let outputText = '';

    if (config.test_cases) {
      for (const testCase of config.test_cases) {
        // In a real implementation, this would actually execute the code
        // For now, we'll just simulate by checking if code contains certain keywords
        const isPassed = code.includes(testCase.expected_output) || code === config.solution_code;
        results[testCase.id] = isPassed;
        if (isPassed) passed++;

        outputText += `Test ${testCase.id}: ${testCase.description}\n`;
        outputText += isPassed ? '✓ PASSED\n' : '✗ FAILED\n';
        outputText += `Expected: ${testCase.expected_output}\n\n`;
      }
    }

    setTestResults(results);
    setOutput(outputText);
    setIsRunning(false);

    // Check if all tests passed
    if (config.test_cases && passed === config.test_cases.length) {
      const score = calculateScore();
      setTimeout(() => {
        onComplete(score);
      }, 1000);
    }
  };

  const calculateScore = () => {
    const totalTests = config.test_cases?.length || 1;
    const passedTests = Object.values(testResults).filter((v) => v).length;
    const testScore = (passedTests / totalTests) * 100;

    // Deduct points for excessive attempts and hints
    let penalties = 0;
    if (attempts > 3) penalties += 10;
    if (currentHintLevel > 0) penalties += currentHintLevel * 5;

    return Math.max(0, Math.round(testScore - penalties));
  };

  const showNextHint = () => {
    setShowHints(true);
    setCurrentHintLevel((prev) => Math.min(prev + 1, config.hints?.length || 0));
  };

  const resetCode = () => {
    setCode(config.starter_code);
    setOutput('');
    setTestResults({});
    setAttempts(0);
  };

  const allTestsPassed = config.test_cases
    ? config.test_cases.every((tc) => testResults[tc.id])
    : false;

  return (
    <div className={`grid ${isFullscreen ? 'grid-cols-2 gap-6 h-full' : 'grid-cols-1 lg:grid-cols-2 gap-4'}`}>
      {/* Instructions & Hints Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {config.instructions}
            </p>

            {config.test_cases && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Test Cases:</h4>
                {config.test_cases.map((tc, index) => (
                  <div
                    key={tc.id}
                    className="flex items-start gap-2 text-sm p-2 rounded bg-muted/50"
                  >
                    <Badge variant="outline" size="sm">
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{tc.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Input: <code className="bg-muted px-1 rounded">{tc.input}</code>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expected: <code className="bg-muted px-1 rounded">{tc.expected_output}</code>
                      </div>
                    </div>
                    {testResults[tc.id] !== undefined && (
                      testResults[tc.id] ? (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hints Section */}
        {config.hints && config.hints.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Hints</CardTitle>
                {currentHintLevel < config.hints.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showNextHint}
                    className="gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Get Hint
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showHints ? (
                <div className="space-y-3">
                  {config.hints.slice(0, currentHintLevel).map((hint, index) => (
                    <div
                      key={hint.id}
                      className="p-3 rounded-lg border border-primary/20 bg-primary/5"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary" size="sm">
                          Hint {index + 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Level {hint.level}
                        </span>
                      </div>
                      <p className="text-sm">{hint.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Stuck? Click &quot;Get Hint&quot; for help. Note: Using hints will reduce your final score.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-muted p-4 rounded overflow-auto max-h-48">
              {output || 'Click "Run Code" to see test results...'}
            </pre>
            {allTestsPassed && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-500">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">All tests passed! Great job!</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Editor Panel */}
      <div className="space-y-4">
        <Card className={isFullscreen ? 'h-full' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Code Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{config.language}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCode}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={isFullscreen ? 'h-[calc(100%-8rem)]' : ''}>
            <div className="space-y-4 h-full flex flex-col">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 min-h-[300px] w-full font-mono text-sm p-4 bg-muted rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Write your code here..."
                spellCheck={false}
              />

              <div className="flex gap-2">
                <Button
                  onClick={executeCode}
                  disabled={isRunning}
                  className="gap-2 flex-1"
                >
                  <Play className="w-4 h-4" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Attempts: {attempts}</span>
                  <span>Hints used: {currentHintLevel}/{config.hints?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
