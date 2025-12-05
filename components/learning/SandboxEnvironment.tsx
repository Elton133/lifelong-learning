'use client';

import { useState, useRef } from 'react';
import { Play, RotateCcw, Download, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { SandboxConfig } from '@/types/database';

interface SandboxEnvironmentProps {
  config: SandboxConfig;
  onComplete: (score: number) => void;
  isFullscreen: boolean;
}

export default function SandboxEnvironment({
  config,
  onComplete,
  isFullscreen,
}: SandboxEnvironmentProps) {
  const [code, setCode] = useState(config.starter_code);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const sessionStartRef = useRef<number>();
  
  if (!sessionStartRef.current) {
    sessionStartRef.current = Date.now();
  }

  const executeCode = async () => {
    setIsRunning(true);
    setHasRun(true);
    setOutput('Executing code...\n\n');

    // Simulate code execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // In a real implementation, this would use a sandboxed environment
      // For now, we'll simulate execution results
      let result = 'Code executed successfully!\n\n';
      
      // Run tests if available
      if (config.tests && config.tests.length > 0) {
        result += 'Running tests...\n';
        const results: string[] = [];
        
        for (let i = 0; i < config.tests.length; i++) {
          // Simulate test execution
          const passed = code.includes('function') || code.includes('def') || code === config.solution;
          results.push(passed ? '✓' : '✗');
          result += `Test ${i + 1}: ${passed ? 'PASSED ✓' : 'FAILED ✗'}\n`;
        }
        
        setTestResults(results);
      } else {
        result += 'No tests configured. Sandbox is in free exploration mode.\n';
      }

      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    setIsRunning(false);
  };

  const resetSandbox = () => {
    setCode(config.starter_code);
    setOutput('');
    setTestResults([]);
    setHasRun(false);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sandbox-code.${getFileExtension(config.language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (language: string) => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
    };
    return extensions[language.toLowerCase()] || 'txt';
  };

  const handleComplete = () => {
    const timeSpent = (Date.now() - (sessionStartRef.current || Date.now())) / 1000 / 60; // in minutes
    
    // Calculate score based on engagement
    let score = 100;
    
    if (!hasRun) {
      // User didn't run any code
      score = 50;
    } else if (testResults.length > 0) {
      // Calculate based on test results
      const passed = testResults.filter((r) => r === '✓').length;
      score = Math.round((passed / testResults.length) * 100);
    }
    
    // Bonus for time spent (engagement)
    if (timeSpent >= 5) {
      score = Math.min(100, score + 10);
    }

    setHasCompleted(true);
    onComplete(score);
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Sandbox Environment</h2>
          <p className="text-sm text-muted-foreground">
            Experiment freely with {config.language} code
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{config.language}</Badge>
          {testResults.length > 0 && (
            <Badge variant="primary">
              {testResults.filter((r) => r === '✓').length} / {testResults.length} tests passed
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid ${isFullscreen ? 'grid-cols-2 gap-6 flex-1' : 'grid-cols-1 lg:grid-cols-2 gap-4'}`}>
        {/* Code Editor */}
        <Card className={isFullscreen ? 'h-full' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Code Editor</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSandbox}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadCode}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={isFullscreen ? 'h-[calc(100%-5rem)]' : ''}>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full font-mono text-sm p-4 bg-muted rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                isFullscreen ? 'h-full' : 'min-h-[400px]'
              }`}
              placeholder="Write your code here..."
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Output & Console */}
        <Card className={isFullscreen ? 'h-full flex flex-col' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">Output & Console</CardTitle>
          </CardHeader>
          <CardContent className={`${isFullscreen ? 'flex-1 flex flex-col' : ''}`}>
            <div className="space-y-4">
              <pre className={`font-mono text-sm bg-muted p-4 rounded overflow-auto ${
                isFullscreen ? 'flex-1 h-[calc(100%-4rem)]' : 'min-h-[300px] max-h-[400px]'
              }`}>
                {output || 'Click "Run Code" to see the output...'}
              </pre>

              <div className="flex gap-2">
                <Button
                  onClick={executeCode}
                  disabled={isRunning}
                  className="gap-2 flex-1"
                >
                  <Play className="w-4 h-4" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                {config.tests && config.tests.length > 0 && (
                  <Button variant="outline" className="gap-2" disabled>
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions/Info */}
      {config.tests && config.tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Try to make your code pass all {config.tests.length} test{config.tests.length !== 1 ? 's' : ''}.
                You can experiment freely and run your code as many times as you need.
              </p>
              {hasRun && testResults.length > 0 && (
                <div className="flex gap-1">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        result === '✓' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={hasCompleted}
          className="gap-2"
          size="lg"
        >
          {hasCompleted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Completed
            </>
          ) : (
            'Complete Session'
          )}
        </Button>
      </div>

      {!hasCompleted && (
        <p className="text-xs text-muted-foreground text-center">
          Explore, experiment, and learn at your own pace. Click &quot;Complete Session&quot; when you&apos;re done.
        </p>
      )}
    </div>
  );
}
