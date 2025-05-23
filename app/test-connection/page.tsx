import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default async function TestConnectionPage() {
  const diagnostics = {
    envCheck: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
    },
    connectionTest: null as any,
    error: null as string | null,
  }

  // Test connection
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      diagnostics.error = "Missing required environment variables"
    } else {
      // Try to create Supabase client
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      // Test a simple query
      const { data, error } = await supabase.from("levels").select("count").limit(1)

      if (error) {
        diagnostics.connectionTest = {
          success: false,
          error: error.message,
          details: error,
        }
      } else {
        diagnostics.connectionTest = {
          success: true,
          data: data,
          message: "Successfully connected to Supabase!",
        }
      }
    }
  } catch (error: any) {
    diagnostics.error = error.message
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Database Connection Test</h1>
        <p className="text-muted-foreground mt-1">Testing Supabase connection with current configuration</p>
      </div>

      {/* Environment Variables Check */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div
              className={`flex justify-between p-2 rounded ${diagnostics.envCheck.supabaseUrl ? "bg-green-50" : "bg-red-50"}`}
            >
              <span>NEXT_PUBLIC_SUPABASE_URL</span>
              <span className={diagnostics.envCheck.supabaseUrl ? "text-green-600" : "text-red-600"}>
                {diagnostics.envCheck.supabaseUrl ? "✅ Set" : "❌ Missing"}
              </span>
            </div>
            <div
              className={`flex justify-between p-2 rounded ${diagnostics.envCheck.supabaseKey ? "bg-green-50" : "bg-red-50"}`}
            >
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span className={diagnostics.envCheck.supabaseKey ? "text-green-600" : "text-red-600"}>
                {diagnostics.envCheck.supabaseKey ? "✅ Set" : "❌ Missing"}
              </span>
            </div>
          </div>

          {diagnostics.envCheck.supabaseUrl && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm">
                <strong>URL:</strong> {diagnostics.envCheck.urlValue}
              </p>
              <p className="text-sm">
                <strong>Key:</strong> {diagnostics.envCheck.keyValue}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Test Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnostics.error ? (
            <Alert variant="destructive">
              <AlertTitle>❌ Configuration Error</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 text-sm">{diagnostics.error}</pre>
              </AlertDescription>
            </Alert>
          ) : diagnostics.connectionTest?.success ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">✅ Connection Successful!</AlertTitle>
              <AlertDescription className="text-green-700">
                <p>{diagnostics.connectionTest.message}</p>
                <pre className="mt-2 bg-green-100 p-2 rounded text-sm">
                  {JSON.stringify(diagnostics.connectionTest.data, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          ) : diagnostics.connectionTest ? (
            <Alert variant="destructive">
              <AlertTitle>❌ Connection Failed</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Error: {diagnostics.connectionTest.error}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">View Details</summary>
                  <pre className="mt-2 bg-red-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(diagnostics.connectionTest.details, null, 2)}
                  </pre>
                </details>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTitle>⏳ Unable to Test</AlertTitle>
              <AlertDescription>Cannot test connection due to missing environment variables.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!diagnostics.envCheck.supabaseUrl || !diagnostics.envCheck.supabaseKey ? (
              <Alert variant="destructive">
                <AlertTitle>Missing Environment Variables</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Add these to your Vercel project:</p>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                    <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : diagnostics.connectionTest && !diagnostics.connectionTest.success ? (
              <div className="space-y-3">
                <Alert>
                  <AlertTitle>Common Solutions</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Verify your Supabase project is active</li>
                      <li>Check if the URL and key are correct</li>
                      <li>Ensure the database tables exist</li>
                      <li>Check Row Level Security (RLS) policies</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {diagnostics.connectionTest.error?.includes("relation") && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTitle className="text-blue-800">Table Missing</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      The "levels" table doesn't exist. You need to create the database schema.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">Connection Working!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your Supabase connection is working. You can now use the full application.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="flex gap-4">
        <Link href="/env-check">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Check Environment Variables
          </button>
        </Link>

        <Link href="/mock-data">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">View Mock Data</button>
        </Link>

        {diagnostics.connectionTest?.success && (
          <Link href="/setup-database">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Setup Database Tables
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}
