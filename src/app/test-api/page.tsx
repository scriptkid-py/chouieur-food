'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestApiPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const tests = [
      {
        name: 'Backend Health Check',
        url: 'https://chouieur-express-backend.onrender.com/api/health',
        description: 'Test if backend is running'
      },
      {
        name: 'CORS Test',
        url: 'https://chouieur-express-backend.onrender.com/api/test-cors',
        description: 'Test CORS configuration'
      },
      {
        name: 'Debug Endpoint',
        url: 'https://chouieur-express-backend.onrender.com/api/debug',
        description: 'Test debug endpoint'
      },
      {
        name: 'Menu Items API',
        url: 'https://chouieur-express-backend.onrender.com/api/menu-items',
        description: 'Test menu items endpoint'
      }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const response = await fetch(test.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        results.push({
          ...test,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          data: data,
          error: null
        });
      } catch (error) {
        results.push({
          ...test,
          status: 'error',
          statusCode: 0,
          data: null,
          error: error.message
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">API Connection Test</CardTitle>
          <CardDescription>
            Test the connection between frontend and backend to diagnose 404 errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={runTests} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run API Tests'
              )}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              {testResults.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.name}</h4>
                      <div className="flex items-center gap-2">
                        {result.status === 'success' ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {result.statusCode}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded">{result.url}</p>
                    
                    {result.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">Error: {result.error}</p>
                      </div>
                    )}
                    
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-blue-600 hover:text-blue-800">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Troubleshooting Guide</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If all tests fail: Backend is not running on Render</li>
              <li>• If CORS test fails: CORS configuration issue</li>
              <li>• If health check passes but menu fails: API endpoint issue</li>
              <li>• Check browser console for additional error details</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
