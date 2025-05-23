"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LiveConnectionTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    setTestResults(null)

    try {
      // Test from client side
      const response = await fetch("/api/test-connection")
      const data = await response.json()
      setTestResults(data)
    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
        clientSideError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Auto-run test on page load
  useEffect(() => {
    runTest()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Live Connection Test</h1>
        <p className="text-muted-foreground mt-1">Testing connection in real-time from both client and server</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Client-Side Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded">
              <strong>Browser can see these variables:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Available" : "❌ Not available"}
                </div>
                <div>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Available" : "❌ Not available"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Server-Side Connection Test
            <Button onClick={runTest} disabled={loading}>
              {loading ? "Testing..." : "Run Test"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Testing connection...</p>
            </div>
          )}

          {testResults && (
            <div className="space-y-4">
              {testResults.success ? (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">✅ Connection Successful!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <p>{testResults.message}</p>
                    {testResults.data && (
                      <pre className="mt-2 bg-green-100 p-2 rounded text-sm">
                        {JSON.stringify(testResults.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>❌ Connection Failed</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Error: {testResults.error}</p>

                    {testResults.env && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                        <strong>Environment Variables on Server:</strong>
                        <div>NEXT_PUBLIC_SUPABASE_URL: {testResults.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌"}</div>
                        <div>
                          NEXT_PUBLIC_SUPABASE_ANON_KEY: {testResults.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅" : "❌"}
                        </div>
                      </div>
                    )}

                    {testResults.clientSideError && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                        <strong>Client-side error:</strong> Could not reach the API endpoint
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">View Full Error Stack</summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">{testResults.stack}</pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTitle>If you see "❌ Not available" above:</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Check that variables are added to Vercel with EXACT names</li>
                  <li>Make sure you redeployed after adding them</li>
                  <li>Variables must start with NEXT_PUBLIC_ to be available in browser</li>
                  <li>Check for typos in variable names</li>
                </ol>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTitle>If connection fails but variables are available:</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Verify Supabase project is active and not paused</li>
                  <li>Check if URL and key are correct in Supabase dashboard</li>
                  <li>Ensure database tables exist</li>
                  <li>Check Row Level Security policies</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
